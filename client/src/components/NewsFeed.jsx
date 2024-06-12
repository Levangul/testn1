const NewsFeed = ({ username, email, text }) => {
  return (
    <div className="NewsFeed">
      <h2>{username}</h2>
      <p>{email}</p>
      <p>{text}</p>
    </div>
  );
};

export default NewsFeed;
