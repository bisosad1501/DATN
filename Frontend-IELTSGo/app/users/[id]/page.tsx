"use client"

import { cn } from "@/lib/utils"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { AppLayout } from "@/components/layout/app-layout"
import { socialApi } from "@/lib/api/notifications"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Award, BookOpen, UserPlus, UserMinus, Trophy, Target, Zap } from "lucide-react"
import { useAuth } from "@/lib/contexts/auth-context"

interface UserProfile {
  id: string
  fullName: string
  email: string
  avatar?: string
  bio?: string
  level: number
  points: number
  coursesCompleted: number
  exercisesCompleted: number
  studyTime: number
  streak: number
  followersCount: number
  followingCount: number
  isFollowing: boolean
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt: string
  rarity: "common" | "rare" | "epic" | "legendary"
}

export default function UserProfilePage() {
  const params = useParams()
  const userId = params.id as string
  const { user: currentUser } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)

  const isOwnProfile = currentUser?.id === userId

  useEffect(() => {
    loadProfile()
    loadAchievements()
  }, [userId])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const data = await socialApi.getUserProfile(userId)
      setProfile(data)
    } catch (error) {
      console.error("Failed to load profile:", error)
      // Mock data for demo
      setProfile({
        id: userId,
        fullName: "Nguyễn Văn A",
        email: "nguyenvana@example.com",
        bio: "IELTS learner aiming for band 8.0. Love practicing speaking and writing!",
        level: 15,
        points: 2500,
        coursesCompleted: 12,
        exercisesCompleted: 45,
        studyTime: 3600,
        streak: 15,
        followersCount: 234,
        followingCount: 156,
        isFollowing: false,
      })
    } finally {
      setLoading(false)
    }
  }

  const loadAchievements = async () => {
    try {
      const data = await socialApi.getUserAchievements(userId)
      setAchievements(data)
    } catch (error) {
      console.error("Failed to load achievements:", error)
      // Mock data
      setAchievements([
        {
          id: "1",
          title: "First Steps",
          description: "Complete your first lesson",
          icon: "🎯",
          unlockedAt: "2024-01-15",
          rarity: "common",
        },
        {
          id: "2",
          title: "Week Warrior",
          description: "Maintain a 7-day study streak",
          icon: "🔥",
          unlockedAt: "2024-01-20",
          rarity: "rare",
        },
        {
          id: "3",
          title: "Perfect Score",
          description: "Get 100% on an exercise",
          icon: "💯",
          unlockedAt: "2024-01-25",
          rarity: "epic",
        },
      ])
    }
  }

  const handleFollow = async () => {
    if (!profile) return
    try {
      if (profile.isFollowing) {
        await socialApi.unfollowUser(userId)
        setProfile({ ...profile, isFollowing: false, followersCount: profile.followersCount - 1 })
      } else {
        await socialApi.followUser(userId)
        setProfile({ ...profile, isFollowing: true, followersCount: profile.followersCount + 1 })
      }
    } catch (error) {
      console.error("Failed to follow/unfollow:", error)
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "bg-gray-100 text-gray-700 border-gray-300"
      case "rare":
        return "bg-blue-100 text-blue-700 border-blue-300"
      case "epic":
        return "bg-purple-100 text-purple-700 border-purple-300"
      case "legendary":
        return "bg-yellow-100 text-yellow-700 border-yellow-300"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  if (loading || !profile) {
    return (
      <AppLayout showSidebar showFooter>
        <div className="container mx-auto py-8 px-4">
          <div className="text-center">Loading profile...</div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout showSidebar showFooter>
      <div className="container mx-auto py-8 px-4">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.avatar || "/placeholder.svg"} />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {profile.fullName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h1 className="text-2xl font-bold">{profile.fullName}</h1>
                    <p className="text-muted-foreground">{profile.email}</p>
                  </div>
                  {!isOwnProfile && (
                    <Button onClick={handleFollow} variant={profile.isFollowing ? "outline" : "default"}>
                      {profile.isFollowing ? (
                        <>
                          <UserMinus className="h-4 w-4 mr-2" />
                          Unfollow
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Follow
                        </>
                      )}
                    </Button>
                  )}
                </div>
                {profile.bio && <p className="text-sm mb-4">{profile.bio}</p>}
                <div className="flex gap-6 text-sm">
                  <div>
                    <span className="font-semibold">{profile.followersCount}</span>
                    <span className="text-muted-foreground ml-1">Followers</span>
                  </div>
                  <div>
                    <span className="font-semibold">{profile.followingCount}</span>
                    <span className="text-muted-foreground ml-1">Following</span>
                  </div>
                  <div>
                    <Badge variant="secondary">Level {profile.level}</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-yellow-100">
                  <Trophy className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{profile.points}</p>
                  <p className="text-sm text-muted-foreground">Total Points</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-blue-100">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{profile.coursesCompleted}</p>
                  <p className="text-sm text-muted-foreground">Courses Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-green-100">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{profile.exercisesCompleted}</p>
                  <p className="text-sm text-muted-foreground">Exercises Done</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-orange-100">
                  <Zap className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{profile.streak}</p>
                  <p className="text-sm text-muted-foreground">Day Streak</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Achievements ({achievements.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement) => (
                <div key={achievement.id} className={cn("p-4 rounded-lg border-2", getRarityColor(achievement.rarity))}>
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{achievement.title}</h4>
                      <p className="text-sm opacity-80 mb-2">{achievement.description}</p>
                      <p className="text-xs opacity-60">
                        Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
