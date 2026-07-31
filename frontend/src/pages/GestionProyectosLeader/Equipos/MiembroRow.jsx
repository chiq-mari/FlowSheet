import React from 'react';
import EditButton from '../../../componentes/ui/EditButton';

export function MiembroRow({
  member,
  index,
  isChecked,
  onCheckChange,
  onEditClick
}) {
  const initial = member.username ? member.username.charAt(0).toUpperCase() : '?';

  return (
    <tr>
      <td style={{ textAlign: 'center' }}>
        <input
          type="checkbox"
          checked={isChecked}
          onChange={onCheckChange}
          className="checkbox-control"
        />
      </td>
      <td>
        <div className="member-info-cell" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {/* Avatar Circle */}
          <div
            className="member-avatar"
            style={{
              width: '2.25rem',
              height: '2.25rem',
              borderRadius: '50%',
              backgroundColor: '#0f172a',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '0.95rem'
            }}
          >
            {initial}
          </div>
          {/* Name & Email */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="member-username" style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.9rem' }}>
              {member.username}
            </span>
            <span className="member-email" style={{ fontSize: '0.75rem', color: '#64748b' }}>
              {member.email || `${member.username}@flowsheet.com`}
            </span>
          </div>
        </div>
      </td>
      <td>
        <span className={`role-name-tag ${index % 2 !== 0 ? 'purple' : ''}`}>
          {member.role_name}
        </span>
      </td>
      <td style={{ textAlign: 'center' }}>
        <EditButton onClick={() => onEditClick(member)} />
      </td>
    </tr>
  );
}

export default MiembroRow;
