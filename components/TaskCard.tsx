import React from 'react';

interface TaskCardProps {
  title: string;
  description?: string;
  icon: string;
  color: string;
  onClick: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ title, icon, description, color, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-xl flex items-center space-x-4 shadow-[0_5px_15px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] hover:scale-[1.03] transition-all duration-300 h-full ${color}`}
    >
      <span className="text-4xl">{icon}</span>
      <div>
        <p className="text-xl font-bold text-left">{title}</p>
        {description && <p className="text-sm opacity-80 text-left">{description}</p>}
      </div>
    </button>
  );
};

export default TaskCard;