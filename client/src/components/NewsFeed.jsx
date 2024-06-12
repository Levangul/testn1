const NewsFeed = ({ username, email, bio }) => {
  return (
    <div className="profile-card">
      <h2>{username}</h2>
      <p>{email}</p>
      <p>{bio}</p>
    </div>
  );
};

export default NewsFeed;
