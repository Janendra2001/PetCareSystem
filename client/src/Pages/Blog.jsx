import React, { useState, useEffect } from 'react';
import NavBar from './NavBar/NavBar';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';
import './Blog.css'; 

const API_KEY = 'live_LtDTwcDvowFaf4CFtXatr6JtdubEqeAK6h4t8cfKMmvIIwSdyKyC7SGgBgnr0rHW';

const Blog = () => {
  const [dogs, setDogs] = useState([]);
  const [text, setText] = useState('');
  const [searchedDogs, setSearchedDogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDogData = async () => {
      try {
        const response = await fetch('https://api.thedogapi.com/v1/breeds', {
          headers: {
            'x-api-key': API_KEY
          }
        });
        const data = await response.json();
        setDogs(data);
        setSearchedDogs(data); // Initialize searchedDogs with all dogs
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchDogData();
  }, []);

  const handleChange = (e) => {
    const searchText = e.target.value.toLowerCase();
    setText(searchText);
    if (searchText === '') {
      setSearchedDogs(dogs); // Reset to all dogs if search text is empty
    } else {
      const filteredDogs = dogs.filter((dog) =>
        dog.name.toLowerCase().includes(searchText)
      );
      setSearchedDogs(filteredDogs);
    }
  };

  return (
    <div>
      <NavBar />
      <div className="container my-5">
        {loading ? (
          <h1 className="text-center text-secondary">Loading...</h1>
        ) : (
          <>
            <div className="text-center mb-5">
              <h3 className="display-4" style={{ fontSize: '1.5rem' }}><b>The Dog Blog</b></h3>
              <form
                className="max-w-xl mx-auto"
                autoComplete="off"
              >
                <input
                  type="text"
                  name="search"
                  id="search"
                  placeholder="Search for a dog / breed"
                  className="py-2 px-4 rounded shadow w-full bg-slate-400 text-black placeholder-white"
                  value={text}
                  onChange={handleChange}
                />
              </form>
            </div>
            <div className="row">
              {searchedDogs.map((dog) => (
                <div className="col-12 col-md-6 col-lg-4 mb-4" key={dog.id || dog.name}>
                  <Link to={`/${dog.name}`} className="text-decoration-none">
                    <div className="card bg-light rounded shadow-sm custom-card">
                      <img src={dog.image && dog.image.url} className="card-img-top" alt={dog.name} />
                      <div className="card-body">
                        <h5 className="card-title">{dog.name}</h5>
                        <p className="card-text">Bred For: {dog.bred_for || 'Unknown'}</p>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Blog;
