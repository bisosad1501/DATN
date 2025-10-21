# ✅ Exercise Module - Test Checklist

## 🎯 Quick Test Checklist

Copy this checklist and tick off as you test each feature.

---

## 1️⃣ Exercise List Page (`/exercises/list`)

### Basic Display
- [ ] Page loads without errors
- [ ] Exercise cards are displayed
- [ ] Each card shows title
- [ ] Each card shows description
- [ ] Each card shows skill type badge
- [ ] Each card shows difficulty badge
- [ ] Each card shows stats (questions, time, sections)

### Filters
- [ ] Skill filter dropdown works
- [ ] Selecting "Listening" filters correctly
- [ ] Selecting "Reading" filters correctly
- [ ] Difficulty filter dropdown works
- [ ] Selecting "Easy" filters correctly
- [ ] Selecting "Medium" filters correctly
- [ ] Selecting "Hard" filters correctly
- [ ] Search box works
- [ ] Typing filters results
- [ ] Clear filters works

### Pagination
- [ ] Pagination shows if > 12 exercises
- [ ] "Next" button works
- [ ] "Previous" button works
- [ ] Page numbers work
- [ ] Current page is highlighted

### Navigation
- [ ] Clicking exercise card navigates to detail page
- [ ] URL changes to `/exercises/[id]`

---

## 2️⃣ Exercise Detail Page (`/exercises/[exerciseId]`)

### Display
- [ ] Page loads without errors
- [ ] Exercise title shows
- [ ] Exercise description shows
- [ ] Skill type badge shows
- [ ] Difficulty badge shows
- [ ] Exercise type badge shows
- [ ] Stats grid shows:
  - [ ] Total questions
  - [ ] Total sections
  - [ ] Time limit
  - [ ] Passing score

### Sections Preview
- [ ] All sections are listed
- [ ] Each section shows:
  - [ ] Section number
  - [ ] Section title
  - [ ] Description
  - [ ] Question count
  - [ ] Time limit (if available)
  - [ ] Instructions (if available)

### Actions
- [ ] "Back to Exercises" button works
- [ ] "Start Exercise" button is visible
- [ ] Clicking "Start Exercise" shows loading
- [ ] Redirects to take page after start
- [ ] URL changes to `/exercises/[id]/take/[submissionId]`

---

## 3️⃣ Take Exercise Page (`/exercises/[exerciseId]/take/[submissionId]`)

### Header
- [ ] Exercise title shows
- [ ] Current question number shows (e.g., "Question 1 of 40")
- [ ] Timer is running (counting up)
- [ ] Answered count badge shows (e.g., "5/40 answered")
- [ ] Progress bar shows and updates

### Question Display
- [ ] Question number shows
- [ ] Question text shows
- [ ] Context text shows (if available)
- [ ] Image shows (if available)
- [ ] Tips show (if available)

### Multiple Choice Questions
- [ ] Radio buttons show for each option
- [ ] Option label shows (A, B, C, D)
- [ ] Option text shows
- [ ] Option image shows (if available)
- [ ] Selecting an option highlights it
- [ ] Only one option can be selected
- [ ] Selected option is saved

### Text Input Questions
- [ ] Text input field shows
- [ ] Can type answer
- [ ] Answer is saved

### Navigation
- [ ] "Previous" button works
- [ ] "Previous" is disabled on first question
- [ ] "Next" button works
- [ ] "Next" is disabled on last question
- [ ] "Submit Exercise" button shows on last question

### Question Navigator
- [ ] Grid of question numbers shows
- [ ] Current question is highlighted (primary color)
- [ ] Answered questions are green
- [ ] Unanswered questions are gray
- [ ] Clicking a number jumps to that question

### Submit
- [ ] Clicking "Submit Exercise" shows confirmation
- [ ] Clicking "Cancel" in confirmation keeps on page
- [ ] Clicking "OK" in confirmation submits
- [ ] Loading state shows during submit
- [ ] Redirects to result page after submit
- [ ] URL changes to `/exercises/[id]/result/[submissionId]`

---

## 4️⃣ Result Page (`/exercises/[exerciseId]/result/[submissionId]`)

### Header
- [ ] Success icon shows if passed (green checkmark)
- [ ] Fail icon shows if not passed (red X)
- [ ] Congratulations message shows

### Score Display
- [ ] Score shows (e.g., "35/40")
- [ ] Progress bar shows
- [ ] Percentage shows (e.g., "87.5%")
- [ ] Band score shows (if available)

### Stats Grid
- [ ] Correct answers count shows (green)
- [ ] Incorrect answers count shows (red)
- [ ] Skipped answers count shows (gray)
- [ ] Time spent shows (blue)
- [ ] Accuracy percentage shows
- [ ] Average time per question shows

### Answer Review
- [ ] All questions are listed
- [ ] Each question shows:
  - [ ] Question number and text
  - [ ] Correct/Incorrect badge
  - [ ] User's answer
  - [ ] Correct answer (if wrong)
  - [ ] Points earned
  - [ ] Time spent
  - [ ] Explanation (if available)
  - [ ] Tips (if available and wrong)

### Actions
- [ ] "Back to Exercises" button works
- [ ] "Try Again" button works
- [ ] "Try Again" navigates to exercise detail page

---

## 5️⃣ History Page (`/exercises/history`)

### Stats Summary
- [ ] Total attempts card shows
- [ ] Completed count card shows
- [ ] In progress count card shows
- [ ] Average score card shows

### Submissions List
- [ ] All submissions are listed
- [ ] Each submission shows:
  - [ ] Exercise title
  - [ ] Status badge (completed, in_progress, abandoned)
  - [ ] Started date
  - [ ] Completed date (if completed)
  - [ ] Attempt number
  - [ ] Score (if completed)
  - [ ] Progress (if in progress)
  - [ ] Percentage (if completed)
  - [ ] Band score (if available)
  - [ ] Time spent
  - [ ] "View Results" or "Continue" button

### Navigation
- [ ] Clicking completed submission navigates to result page
- [ ] Clicking in-progress submission navigates to take page
- [ ] Clicking submission card navigates correctly

### Pagination
- [ ] Pagination shows if > 20 submissions
- [ ] "Next" button works
- [ ] "Previous" button works
- [ ] Page numbers show correctly

---

## 6️⃣ Responsive Design

### Mobile (< 768px)
- [ ] Exercise list shows 1 column
- [ ] Cards are full width
- [ ] Filters stack vertically
- [ ] Stats grid shows 2 columns
- [ ] Question navigator wraps properly
- [ ] Buttons are full width

### Tablet (768px - 1024px)
- [ ] Exercise list shows 2 columns
- [ ] Stats grid shows 2-3 columns
- [ ] Layout is balanced

### Desktop (> 1024px)
- [ ] Exercise list shows 3 columns
- [ ] Stats grid shows 4 columns
- [ ] All content is readable
- [ ] No horizontal scroll

---

## 7️⃣ Error Handling

### Network Errors
- [ ] Shows error message if API fails
- [ ] Shows "Exercise not found" if invalid ID
- [ ] Shows "Results not found" if invalid submission ID
- [ ] Shows user-friendly error messages

### Empty States
- [ ] Shows "No exercises found" if list is empty
- [ ] Shows "You haven't attempted any exercises yet" if history is empty
- [ ] Shows "No sections available" if exercise has no sections

### Loading States
- [ ] Shows spinner while loading exercises
- [ ] Shows spinner while loading exercise detail
- [ ] Shows spinner while starting exercise
- [ ] Shows spinner while submitting answers
- [ ] Shows spinner while loading result
- [ ] Shows spinner while loading history

---

## 8️⃣ Performance

### Load Times
- [ ] Exercise list loads in < 2 seconds
- [ ] Exercise detail loads in < 2 seconds
- [ ] Take page loads in < 2 seconds
- [ ] Result page loads in < 2 seconds
- [ ] History page loads in < 2 seconds

### Console
- [ ] No console errors
- [ ] No console warnings (or only minor ones)
- [ ] API calls are logged correctly

### Images
- [ ] All images load properly
- [ ] No broken image icons
- [ ] Images are optimized

---

## 9️⃣ Browser Compatibility

### Chrome
- [ ] All features work
- [ ] UI looks correct

### Firefox
- [ ] All features work
- [ ] UI looks correct

### Safari
- [ ] All features work
- [ ] UI looks correct

### Edge
- [ ] All features work
- [ ] UI looks correct

---

## 🔟 Accessibility

### Keyboard Navigation
- [ ] Can tab through all interactive elements
- [ ] Can select options with keyboard
- [ ] Can submit with Enter key

### Screen Reader
- [ ] All buttons have labels
- [ ] All images have alt text
- [ ] Form fields have labels

---

## 📊 Test Summary

**Total Tests**: ~150+

**Passed**: _____ / _____

**Failed**: _____ / _____

**Blocked**: _____ / _____

---

## 🐛 Issues Found

| # | Page | Issue | Severity | Status |
|---|------|-------|----------|--------|
| 1 |      |       |          |        |
| 2 |      |       |          |        |
| 3 |      |       |          |        |

**Severity**: Critical / High / Medium / Low

**Status**: Open / In Progress / Fixed / Won't Fix

---

## ✅ Sign Off

**Tested By**: _________________

**Date**: _________________

**Approved**: [ ] Yes [ ] No

**Notes**:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

---

**Happy Testing! 🎉**

