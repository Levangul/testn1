import React, { useState, useEffect, useCallback } from "react";
import { useLazyQuery } from "@apollo/client";
import { SEARCH_USER } from "../utils/queries";
import { useNavigate } from "react-router-dom";
import UserCard from "./UserCard";
import { debounce } from "../utils/debounce";

const SearchUser = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchUser, { loading, data, error }] = useLazyQuery(SEARCH_USER);
  const navigate = useNavigate();

  const debouncedSearch = useCallback(
    debounce((term) => {
      if (term.trim()) {
        console.log(`Searching for: ${term}`);
        searchUser({ variables: { username: term } });
      }
    }, 300),
    [searchUser] 
  );

  useEffect(() => {
    if (searchTerm) {
      debouncedSearch(searchTerm);
    }
  }, [searchTerm, debouncedSearch]);

  const handleUserClick = (username) => {
    console.log(`Navigating to user profile: ${username}`);
    navigate(`/user/${username}`);
  };

  return (
    <div className="search-container">
      <input
        type="text"
        placeholder="Search for a user..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {data && data.searchUser && (
        <div className="search-results">
          {data.searchUser.map((user) => (
            <UserCard key={user.id} user={user} onClick={() => handleUserClick(user.username)} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchUser;
