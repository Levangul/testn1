import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLazyQuery } from "@apollo/client";
import { SEARCH_USER } from "../utils/queries";
import { useNavigate } from "react-router-dom";
import UserCard from "./UserCard";
import { debounce } from "../utils/debounce";

const SearchUser = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchUser, { loading, data, error }] = useLazyQuery(SEARCH_USER);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();
  const searchContainerRef = useRef(null);

  const debouncedSearch = useCallback(
    debounce((term) => {
      if (term.trim()) {
        console.log(`Searching for: ${term}`);
        const [name, lastname] = term.split(' ');
        searchUser({ variables: { name, lastname: lastname || "" } });
        setShowResults(true);
      } else {
        setShowResults(false);
      }
    }, 300),
    [searchUser]
  );

  useEffect(() => {
    if (searchTerm) {
      debouncedSearch(searchTerm);
    } else {
      setShowResults(false);
    }
  }, [searchTerm, debouncedSearch]);

  const handleUserClick = (name, lastname) => {
    console.log(`Navigating to user profile: ${name} ${lastname}`);
    navigate(`/user/${name}/${lastname}`);
    setShowResults(false); // Hide results after clicking on a user
  };

  const handleClickOutside = (event) => {
    if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
      setShowResults(false); // Hide results when clicking outside
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="search-container" ref={searchContainerRef}>
      <input
        type="text"
        placeholder="Search for a user..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {showResults && data && data.searchUser && (
        <div className="search-results absolute bg-white shadow-lg z-50 w-full">
          {data.searchUser.map((user) => (
            <UserCard key={user.id} user={user} onClick={() => handleUserClick(user.name, user.lastname)} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchUser;
