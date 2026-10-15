import { isValidObjectId } from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

function badRequest(message: string) {
  const error = new Error(message) as Error & { status?: number };
  error.status = 400;
  return error;
}

function notFound(message: string) {
  const error = new Error(message) as Error & { status?: number };
  error.status = 404;
  return error;
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  const payload = (input ?? {}) as Record<string, unknown>;
  const { userId, teamId, type, minutes } = payload;

  if (typeof userId !== 'string' || !isValidObjectId(userId)) {
    throw badRequest('A valid userId is required.');
  }
  if (typeof teamId !== 'string' || !isValidObjectId(teamId)) {
    throw badRequest('A valid teamId is required.');
  }
  if (typeof type !== 'string' || !type.trim()) {
    throw badRequest('Activity type is required.');
  }
  const minutesValue = Number(minutes);
  if (!Number.isFinite(minutesValue) || minutesValue <= 0) {
    throw badRequest('Minutes must be a positive number.');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw badRequest('User not found.');
  }
  const team = await Team.findById(teamId);
  if (!team) {
    throw badRequest('Team not found.');
  }

  const activity = await Activity.create({
    user: userId,
    team: teamId,
    type: type.trim(),
    minutes: minutesValue,
    points: Math.max(1, Math.round(minutesValue / 5)),
    occurredAt: new Date(),
  });

  return activity.toObject();
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  const payload = (input ?? {}) as Record<string, unknown>;
  const name = typeof payload.name === 'string' ? payload.name.trim() : '';
  const mascot = typeof payload.mascot === 'string' ? payload.mascot.trim() : '';

  if (!name) {
    throw badRequest('Team name is required.');
  }
  if (!mascot) {
    throw badRequest('Team mascot is required.');
  }

  const members = Array.isArray(payload.members) ? payload.members : [];
  const validMembers = members.map((member) => String(member)).filter((member) => isValidObjectId(member));
  if (members.length !== validMembers.length) {
    throw badRequest('All member identifiers must be valid user ids.');
  }

  const team = await Team.create({ name, mascot, members: validMembers });
  return team.toObject();
}

export async function getLeaderboard() {
  const leaderboard = await Activity.aggregate([
    { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    { $lookup: { from: 'teams', localField: '_id', foreignField: '_id', as: 'team' } },
    { $unwind: '$team' },
    { $sort: { totalPoints: -1, _id: 1 } },
    { $project: { _id: 0, teamName: '$team.name', totalPoints: 1 } },
  ]);

  return leaderboard.map((entry, index) => ({
    teamName: entry.teamName,
    totalPoints: entry.totalPoints,
    rank: index + 1,
  }));
}

export async function suggestWorkouts(userEmail: string) {
  const email = userEmail?.trim();
  if (!email) {
    throw badRequest('A user email is required.');
  }

  const user = await User.findOne({ email }).lean();
  if (!user) {
    throw notFound('User not found.');
  }

  const recentActivities = await Activity.find({ user: user._id }).sort({ occurredAt: -1 }).limit(3).lean();
  const focusMap: Record<string, string> = {
    run: 'endurance',
    cycle: 'cardio',
    swim: 'endurance',
    walk: 'mobility',
    strength: 'strength',
    yoga: 'mobility',
  };

  const recentType = recentActivities[0]?.type as string | undefined;
  const preferredFocus = (user.fitnessGoal as string | undefined) || focusMap[recentType ?? ''] || 'endurance';

  const workouts = await Workout.find({ focus: preferredFocus }).sort({ minutes: 1 }).lean();
  const fallbackWorkouts = workouts.length > 0 ? workouts : await Workout.find().sort({ minutes: 1 }).lean();

  return fallbackWorkouts.map((workout) => ({
    ...workout,
    reason: `This suggestion matches your recent ${recentType ?? preferredFocus} activity and supports your ${preferredFocus} goal.`,
  }));
}

export { User };
