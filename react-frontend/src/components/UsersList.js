import React from 'react';
import PropTypes from 'prop-types';

const UsersList = ({ users, setSelectedUser }) => {
  return (
    <div className="users-list">
      {users.map((userId) => (
        <div
          key={userId}
          className="user-item"
          onClick={() => setSelectedUser(userId)}
        >
          {userId}
        </div>
      ))}
      <div
        className="user-item group-chat-item"
        onClick={() => setSelectedUser(null)}
      >
        Group Chat
      </div>
    </div>
  );
};

UsersList.propTypes = {
  users: PropTypes.arrayOf(PropTypes.string).isRequired,
  setSelectedUser: PropTypes.func.isRequired,
};

export default UsersList;
