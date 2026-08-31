export interface UnassignedStudent {
  id: string;
  displayName: string;
  email: string;
  href: string;
}

export interface StaffUpcomingClass {
  id: string;
  title: string;
  teacherName: string;
  scheduledAtIso: string;
  dateLabel: string;
  statusLabel: string;
  href: string;
}

export interface StaffDashboard {
  studentCount: number;
  activeTeacherCount: number;
  inactiveTeacherCount: number;
  coursesByStatus: { code: string; label: string; count: number }[];
  unassignedStudents: UnassignedStudent[];
  upcomingClasses: StaffUpcomingClass[];
}
