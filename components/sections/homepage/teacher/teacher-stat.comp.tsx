import "./teacher-stat.comp.css";

interface TeacherStatProps {
  value: string;
  label: string;
}

export function TeacherStat({ value, label }: TeacherStatProps) {
  return (
    <div className="teacher__stat">
      <span className="teacher__stat-value">{value}</span>
      <p className="teacher__stat-label">{label}</p>
    </div>
  );
}
