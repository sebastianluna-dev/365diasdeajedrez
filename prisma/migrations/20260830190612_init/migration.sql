-- CreateTable
CREATE TABLE "CourseType" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CourseType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseStatus" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CourseStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthorRole" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AuthorRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Level" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Level_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PresentationMode" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PresentationMode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InitialPositionType" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "InitialPositionType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BoardOrientation" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "BoardOrientation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseMode" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ExerciseMode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgressStatus" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProgressStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttemptResult" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AttemptResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttemptContext" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AttemptContext_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OwnerType" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "OwnerType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DatabaseKind" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DatabaseKind_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameSource" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "GameSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameResult" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "GameResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassStatus" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ClassStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeetingProvider" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "MeetingProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassBlockKind" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ClassBlockKind_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TranscriptStatus" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TranscriptStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityType" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ActivityType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubjectType" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SubjectType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatMetric" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "StatMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "parentId" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "cover" TEXT,
    "typeId" INTEGER NOT NULL,
    "statusId" INTEGER NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Author" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "bio" TEXT,
    "photo" TEXT,

    CONSTRAINT "Author_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseAuthor" (
    "courseId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "roleId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CourseAuthor_pkey" PRIMARY KEY ("courseId","authorId")
);

-- CreateTable
CREATE TABLE "CourseLevel" (
    "courseId" TEXT NOT NULL,
    "levelId" INTEGER NOT NULL,

    CONSTRAINT "CourseLevel_pkey" PRIMARY KEY ("courseId","levelId")
);

-- CreateTable
CREATE TABLE "Chapter" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "estimatedDuration" INTEGER,

    CONSTRAINT "Chapter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lesson" (
    "id" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "isPriority" BOOLEAN NOT NULL DEFAULT false,
    "estimatedDuration" INTEGER,
    "presentationModeId" INTEGER NOT NULL,
    "initialPositionTypeId" INTEGER NOT NULL,
    "initialFen" TEXT,
    "orientationId" INTEGER NOT NULL,
    "pgn" TEXT NOT NULL,
    "pgnUpdatedAt" TIMESTAMP(3),

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingExercise" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "modeId" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "startPly" INTEGER NOT NULL,
    "endPly" INTEGER NOT NULL,
    "startFen" TEXT NOT NULL,
    "line" TEXT NOT NULL,
    "promptText" TEXT,

    CONSTRAINT "TrainingExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonTopic" (
    "lessonId" TEXT NOT NULL,
    "topicId" INTEGER NOT NULL,

    CONSTRAINT "LessonTopic_pkey" PRIMARY KEY ("lessonId","topicId")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseProgress" (
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "statusId" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "lastLessonId" TEXT,

    CONSTRAINT "CourseProgress_pkey" PRIMARY KEY ("userId","courseId")
);

-- CreateTable
CREATE TABLE "ChapterProgress" (
    "userId" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "statusId" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "quizPassedAt" TIMESTAMP(3),

    CONSTRAINT "ChapterProgress_pkey" PRIMARY KEY ("userId","chapterId")
);

-- CreateTable
CREATE TABLE "LessonProgress" (
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "statusId" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "LessonProgress_pkey" PRIMARY KEY ("userId","lessonId")
);

-- CreateTable
CREATE TABLE "TrainingAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "resultId" INTEGER NOT NULL,
    "mistakes" INTEGER NOT NULL DEFAULT 0,
    "durationMs" INTEGER,
    "contextId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainingAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCourseSettings" (
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "onlyPriorityLessons" BOOLEAN NOT NULL DEFAULT false,
    "boardOrientationId" INTEGER NOT NULL,
    "trainingAfterLesson" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCourseSettings_pkey" PRIMARY KEY ("userId","courseId")
);

-- CreateTable
CREATE TABLE "UserTrainerChapter" (
    "userId" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserTrainerChapter_pkey" PRIMARY KEY ("userId","chapterId")
);

-- CreateTable
CREATE TABLE "GameDatabase" (
    "id" TEXT NOT NULL,
    "ownerTypeId" INTEGER NOT NULL,
    "userId" TEXT,
    "courseId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "kindId" INTEGER NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameDatabase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "databaseId" TEXT NOT NULL,
    "white" TEXT NOT NULL,
    "black" TEXT NOT NULL,
    "whiteElo" INTEGER,
    "blackElo" INTEGER,
    "resultId" INTEGER NOT NULL,
    "playedAt" DATE,
    "event" TEXT,
    "site" TEXT,
    "round" TEXT,
    "eco" TEXT,
    "initialFen" TEXT,
    "pgn" TEXT NOT NULL,
    "tags" JSONB,
    "sourceId" INTEGER NOT NULL,
    "isOwnGame" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Teacher" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "title" TEXT,
    "bio" TEXT,
    "photo" TEXT,
    "timezone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Class" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "durationMin" INTEGER NOT NULL,
    "statusId" INTEGER NOT NULL,
    "meetingProviderId" INTEGER,
    "meetingUrl" TEXT,
    "meetingUrlVisibleFrom" TIMESTAMP(3),
    "recordingUrl" TEXT,
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Class_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassParticipant" (
    "classId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "paidAt" TIMESTAMP(3),
    "amount" DECIMAL(10,2),
    "currency" TEXT,
    "paymentRef" TEXT,
    "attended" BOOLEAN NOT NULL DEFAULT false,
    "joinedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClassParticipant_pkey" PRIMARY KEY ("classId","userId")
);

-- CreateTable
CREATE TABLE "ClassBlock" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "kindId" INTEGER NOT NULL,
    "text" TEXT,
    "videoUrl" TEXT,
    "gameId" TEXT,
    "lessonId" TEXT,
    "positionId" TEXT,
    "movePath" TEXT,
    "caption" TEXT,

    CONSTRAINT "ClassBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassTranscript" (
    "classId" TEXT NOT NULL,
    "provider" TEXT,
    "language" TEXT,
    "statusId" INTEGER NOT NULL,
    "text" TEXT,
    "segments" JSONB,
    "durationMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClassTranscript_pkey" PRIMARY KEY ("classId")
);

-- CreateTable
CREATE TABLE "Position" (
    "id" TEXT NOT NULL,
    "ownerTypeId" INTEGER NOT NULL,
    "userId" TEXT,
    "courseId" TEXT,
    "title" TEXT,
    "fen" TEXT NOT NULL,
    "orientationId" INTEGER NOT NULL,
    "arrows" JSONB,
    "highlights" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "typeId" INTEGER NOT NULL,
    "subjectTypeId" INTEGER NOT NULL,
    "subjectId" TEXT NOT NULL,
    "topicId" INTEGER,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "meta" JSONB,

    CONSTRAINT "UserActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserStatDaily" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "metricId" INTEGER NOT NULL,
    "topicId" INTEGER,
    "value" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UserStatDaily_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CourseType_code_key" ON "CourseType"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CourseStatus_code_key" ON "CourseStatus"("code");

-- CreateIndex
CREATE UNIQUE INDEX "AuthorRole_code_key" ON "AuthorRole"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Level_code_key" ON "Level"("code");

-- CreateIndex
CREATE UNIQUE INDEX "PresentationMode_code_key" ON "PresentationMode"("code");

-- CreateIndex
CREATE UNIQUE INDEX "InitialPositionType_code_key" ON "InitialPositionType"("code");

-- CreateIndex
CREATE UNIQUE INDEX "BoardOrientation_code_key" ON "BoardOrientation"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ExerciseMode_code_key" ON "ExerciseMode"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ProgressStatus_code_key" ON "ProgressStatus"("code");

-- CreateIndex
CREATE UNIQUE INDEX "AttemptResult_code_key" ON "AttemptResult"("code");

-- CreateIndex
CREATE UNIQUE INDEX "AttemptContext_code_key" ON "AttemptContext"("code");

-- CreateIndex
CREATE UNIQUE INDEX "OwnerType_code_key" ON "OwnerType"("code");

-- CreateIndex
CREATE UNIQUE INDEX "DatabaseKind_code_key" ON "DatabaseKind"("code");

-- CreateIndex
CREATE UNIQUE INDEX "GameSource_code_key" ON "GameSource"("code");

-- CreateIndex
CREATE UNIQUE INDEX "GameResult_code_key" ON "GameResult"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ClassStatus_code_key" ON "ClassStatus"("code");

-- CreateIndex
CREATE UNIQUE INDEX "MeetingProvider_code_key" ON "MeetingProvider"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ClassBlockKind_code_key" ON "ClassBlockKind"("code");

-- CreateIndex
CREATE UNIQUE INDEX "TranscriptStatus_code_key" ON "TranscriptStatus"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityType_code_key" ON "ActivityType"("code");

-- CreateIndex
CREATE UNIQUE INDEX "SubjectType_code_key" ON "SubjectType"("code");

-- CreateIndex
CREATE UNIQUE INDEX "StatMetric_code_key" ON "StatMetric"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_code_key" ON "Topic"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Course_slug_key" ON "Course"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Author_slug_key" ON "Author"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Chapter_courseId_order_key" ON "Chapter"("courseId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Lesson_chapterId_order_key" ON "Lesson"("chapterId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingExercise_lessonId_order_key" ON "TrainingExercise"("lessonId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "TrainingAttempt_userId_createdAt_idx" ON "TrainingAttempt"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "TrainingAttempt_exerciseId_idx" ON "TrainingAttempt"("exerciseId");

-- CreateIndex
CREATE INDEX "GameDatabase_userId_idx" ON "GameDatabase"("userId");

-- CreateIndex
CREATE INDEX "GameDatabase_courseId_idx" ON "GameDatabase"("courseId");

-- CreateIndex
CREATE INDEX "Game_databaseId_idx" ON "Game"("databaseId");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_userId_key" ON "Teacher"("userId");

-- CreateIndex
CREATE INDEX "Class_scheduledAt_idx" ON "Class"("scheduledAt");

-- CreateIndex
CREATE INDEX "Class_teacherId_idx" ON "Class"("teacherId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassBlock_classId_order_key" ON "ClassBlock"("classId", "order");

-- CreateIndex
CREATE INDEX "UserActivity_userId_occurredAt_idx" ON "UserActivity"("userId", "occurredAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserStatDaily_userId_day_metricId_topicId_key" ON "UserStatDaily"("userId", "day", "metricId", "topicId");

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "CourseType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "CourseStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseAuthor" ADD CONSTRAINT "CourseAuthor_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseAuthor" ADD CONSTRAINT "CourseAuthor_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseAuthor" ADD CONSTRAINT "CourseAuthor_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "AuthorRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseLevel" ADD CONSTRAINT "CourseLevel_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseLevel" ADD CONSTRAINT "CourseLevel_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chapter" ADD CONSTRAINT "Chapter_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_presentationModeId_fkey" FOREIGN KEY ("presentationModeId") REFERENCES "PresentationMode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_initialPositionTypeId_fkey" FOREIGN KEY ("initialPositionTypeId") REFERENCES "InitialPositionType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_orientationId_fkey" FOREIGN KEY ("orientationId") REFERENCES "BoardOrientation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingExercise" ADD CONSTRAINT "TrainingExercise_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingExercise" ADD CONSTRAINT "TrainingExercise_modeId_fkey" FOREIGN KEY ("modeId") REFERENCES "ExerciseMode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonTopic" ADD CONSTRAINT "LessonTopic_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonTopic" ADD CONSTRAINT "LessonTopic_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseProgress" ADD CONSTRAINT "CourseProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseProgress" ADD CONSTRAINT "CourseProgress_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseProgress" ADD CONSTRAINT "CourseProgress_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "ProgressStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseProgress" ADD CONSTRAINT "CourseProgress_lastLessonId_fkey" FOREIGN KEY ("lastLessonId") REFERENCES "Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChapterProgress" ADD CONSTRAINT "ChapterProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChapterProgress" ADD CONSTRAINT "ChapterProgress_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChapterProgress" ADD CONSTRAINT "ChapterProgress_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "ProgressStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "ProgressStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingAttempt" ADD CONSTRAINT "TrainingAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingAttempt" ADD CONSTRAINT "TrainingAttempt_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "TrainingExercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingAttempt" ADD CONSTRAINT "TrainingAttempt_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "AttemptResult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingAttempt" ADD CONSTRAINT "TrainingAttempt_contextId_fkey" FOREIGN KEY ("contextId") REFERENCES "AttemptContext"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCourseSettings" ADD CONSTRAINT "UserCourseSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCourseSettings" ADD CONSTRAINT "UserCourseSettings_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCourseSettings" ADD CONSTRAINT "UserCourseSettings_boardOrientationId_fkey" FOREIGN KEY ("boardOrientationId") REFERENCES "BoardOrientation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTrainerChapter" ADD CONSTRAINT "UserTrainerChapter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTrainerChapter" ADD CONSTRAINT "UserTrainerChapter_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameDatabase" ADD CONSTRAINT "GameDatabase_ownerTypeId_fkey" FOREIGN KEY ("ownerTypeId") REFERENCES "OwnerType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameDatabase" ADD CONSTRAINT "GameDatabase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameDatabase" ADD CONSTRAINT "GameDatabase_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameDatabase" ADD CONSTRAINT "GameDatabase_kindId_fkey" FOREIGN KEY ("kindId") REFERENCES "DatabaseKind"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_databaseId_fkey" FOREIGN KEY ("databaseId") REFERENCES "GameDatabase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "GameResult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "GameSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Teacher" ADD CONSTRAINT "Teacher_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "ClassStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_meetingProviderId_fkey" FOREIGN KEY ("meetingProviderId") REFERENCES "MeetingProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassParticipant" ADD CONSTRAINT "ClassParticipant_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassParticipant" ADD CONSTRAINT "ClassParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassBlock" ADD CONSTRAINT "ClassBlock_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassBlock" ADD CONSTRAINT "ClassBlock_kindId_fkey" FOREIGN KEY ("kindId") REFERENCES "ClassBlockKind"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassBlock" ADD CONSTRAINT "ClassBlock_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassBlock" ADD CONSTRAINT "ClassBlock_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassBlock" ADD CONSTRAINT "ClassBlock_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassTranscript" ADD CONSTRAINT "ClassTranscript_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassTranscript" ADD CONSTRAINT "ClassTranscript_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "TranscriptStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_ownerTypeId_fkey" FOREIGN KEY ("ownerTypeId") REFERENCES "OwnerType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_orientationId_fkey" FOREIGN KEY ("orientationId") REFERENCES "BoardOrientation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserActivity" ADD CONSTRAINT "UserActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserActivity" ADD CONSTRAINT "UserActivity_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "ActivityType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserActivity" ADD CONSTRAINT "UserActivity_subjectTypeId_fkey" FOREIGN KEY ("subjectTypeId") REFERENCES "SubjectType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserActivity" ADD CONSTRAINT "UserActivity_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserStatDaily" ADD CONSTRAINT "UserStatDaily_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserStatDaily" ADD CONSTRAINT "UserStatDaily_metricId_fkey" FOREIGN KEY ("metricId") REFERENCES "StatMetric"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserStatDaily" ADD CONSTRAINT "UserStatDaily_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ---------------------------------------------------------------------------
-- Manual constraints (not expressible in the Prisma schema; see prisma/schema.prisma)
-- ---------------------------------------------------------------------------

-- GameDatabase: exactly one owner (USER -> userId, COURSE -> courseId)
ALTER TABLE "GameDatabase" ADD CONSTRAINT "game_database_owner_xor"
  CHECK (("userId" IS NOT NULL) <> ("courseId" IS NOT NULL));

-- Position: exactly one owner column (TEACHER ones use userId)
ALTER TABLE "Position" ADD CONSTRAINT "position_owner_xor"
  CHECK (("userId" IS NOT NULL) <> ("courseId" IS NOT NULL));

-- ClassBlock: at most one content reference
ALTER TABLE "ClassBlock" ADD CONSTRAINT "class_block_single_ref"
  CHECK ((("gameId" IS NOT NULL)::int + ("lessonId" IS NOT NULL)::int + ("positionId" IS NOT NULL)::int) <= 1);

-- UserStatDaily: replaces Prisma's unique index so that a NULL topicId does
-- not allow duplicate rows (PostgreSQL 15+)
DROP INDEX "UserStatDaily_userId_day_metricId_topicId_key";
CREATE UNIQUE INDEX "UserStatDaily_userId_day_metricId_topicId_key"
  ON "UserStatDaily"("userId", "day", "metricId", "topicId") NULLS NOT DISTINCT;
