// src/componentes/NotificationRow.jsx
import React from 'react';
import { UserAvatar } from './UserAvatar';
import ProgressBar from './ProgressBar';
import './NotificationRow.css';

export function NotificationRow({ notif }) {
  // Format the date to YYYY-MM-DD
  const dateObj = new Date(notif.date);
  const formattedDate = !isNaN(dateObj) 
    ? dateObj.toISOString().split('T')[0] 
    : notif.date;

  // Format time (HH:MM)
  const formattedTime = notif.notification_time 
    ? notif.notification_time.substring(0, 5) 
    : '';

  const timestamp = `${formattedDate} ${formattedTime}`.trim();
  const employeeFullName = `${notif.person_na} ${notif.person_ln}`;

  return (
    <div className="notification-row">
      <div className="row-avatar-container">
        <UserAvatar name={employeeFullName} size={40} />
      </div>
      
      <div className="row-content">
        <div className="row-header">
          <span className="activity-name">{notif.assignment_name}</span>
          <span className="project-tag">
            <svg className="project-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            {notif.project_name}
          </span>
        </div>

        <div className="row-meta">
          <span className="employee-username">@{notif.user_na}</span>
          <span className="meta-separator">•</span>
          <span className="notification-timestamp">{timestamp}</span>
        </div>

        {notif.observation && (
          <p className="row-observation">
            {notif.observation}
          </p>
        )}

        <div className="row-progress-container">
          <ProgressBar percentage={notif.progress_percentage} hours={notif.total_hours_spent} />
        </div>
      </div>
    </div>
  );
}

export default NotificationRow;
