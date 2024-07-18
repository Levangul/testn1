import React from "react";
import PropTypes from "prop-types";

const UserCard = ({ user, onClick }) => {
  return (
    <div className="user-card" onClick={() => onClick(user.name, user.lastname)}>
      <img
        src={user.profilePicture || "https://via.placeholder.com/150"}
        alt={`${user.name} ${user.lastname}`}
        className="user-card-image"
      />
      <div className="user-card-info">
        <h3>{user.name} {user.lastname}</h3>
        <p>{user.city}</p>
      </div>
    </div>
  );
};

UserCard.propTypes = {
  user: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default UserCard;
