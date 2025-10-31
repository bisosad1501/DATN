#!/usr/bin/env bash
set -euo pipefail

API_BASE="${API_BASE:-http://localhost:8080/api/v1}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@example.com}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-Admin@123}"

note() { echo "[seed] $*"; }

die() { echo "[seed][ERROR] $*" >&2; exit 1; }

get_token() {
  note "Logging in as admin..."
  local resp token
  resp=$(curl -s -S -X POST "$API_BASE/auth/login" -H 'Content-Type: application/json' \
    -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}") || die "Login failed"
  token=$(echo "$resp" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
  [[ -n "$token" ]] || die "Cannot extract token"
  echo "$token"
}

create_course() {
  local token="$1"; shift
  local title="$1"; local slug="$2"; local skill="$3"; local level="$4"; shift 4
  local payload
  payload=$(jq -n --arg title "$title" --arg slug "$slug" --arg skill "$skill" --arg level "$level" '{
    title:$title,
    slug:$slug,
    description:"Auto-seeded course",
    short_description:"Auto-seeded",
    skill_type:$skill,
    level:$level,
    enrollment_type:"free",
    target_band_score:7,
    status:"draft"
  }')
  note "Creating course: $title ($slug)"
  curl -s -S -X POST "$API_BASE/admin/courses" -H "Authorization: Bearer $token" -H 'Content-Type: application/json' \
    -d "$payload" | jq -r '.data.id // empty'
}

publish_course() {
  local token="$1"; local id="$2"
  note "Publishing course: $id"
  curl -s -S -X POST "$API_BASE/admin/courses/$id/publish" -H "Authorization: Bearer $token" | jq -r '.success'
}

create_module() {
  local token="$1"; local course_id="$2"; local title="$3"; local order="$4"
  local payload
  payload=$(jq -n --arg cid "$course_id" --arg title "$title" --argjson display_order "$order" '{course_id:$cid,title:$title,display_order:$display_order}')
  note "Creating module: $title"
  curl -s -S -X POST "$API_BASE/admin/modules" -H "Authorization: Bearer $token" -H 'Content-Type: application/json' \
    -d "$payload" | jq -r '.data.id // empty'
}

create_lesson() {
  local token="$1"; local module_id="$2"; local title="$3"; local order="$4"; local duration_min="$5"
  local payload
  payload=$(jq -n --arg mid "$module_id" --arg title "$title" --argjson display_order "$order" --argjson duration "$duration_min" '{
    module_id:$mid,title:$title,display_order:$display_order,duration_minutes:$duration
  }')
  note "Creating lesson: $title"
  curl -s -S -X POST "$API_BASE/admin/lessons" -H "Authorization: Bearer $token" -H 'Content-Type: application/json' \
    -d "$payload" | jq -r '.data.id // empty'
}

main() {
  command -v jq >/dev/null 2>&1 || die "jq is required"
  local token
  token=$(get_token)

  # Example seeded courses
  declare -a COURSES=(
    "IELTS Speaking Basics|ielts-speaking-basics|speaking|beginner"
    "IELTS Writing Essentials|ielts-writing-essentials|writing|intermediate"
  )

  for item in "${COURSES[@]}"; do
    IFS='|' read -r title slug skill level <<< "$item"
    cid=$(create_course "$token" "$title" "$slug" "$skill" "$level")
    [[ -n "$cid" ]] || die "Failed to create course: $title"
    mid=$(create_module "$token" "$cid" "Module 1: Getting Started" 1)
    [[ -n "$mid" ]] || die "Failed to create module"
    create_lesson "$token" "$mid" "Lesson 1: Introduction" 1 8 >/dev/null
    create_lesson "$token" "$mid" "Lesson 2: Practice" 2 10 >/dev/null
    publish_course "$token" "$cid" >/dev/null
  done

  note "Done."
}

main "$@"
