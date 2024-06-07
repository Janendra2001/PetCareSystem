import React, { useState, useEffect } from "react"
import { Link, useParams } from "react-router-dom"

const SingleDog = () => {
  const [dog, setDog] = useState([])
  const { name } = useParams()

  useEffect(() => {
    const fetchSingleDogData = async () => {
      try {
        const res = await fetch(
          `https://api.thedogapi.com/v1/breeds/search?q=${name}`
        )
        const data = await res.json()
        setDog(data)
        console.log(data)
      } catch (error) {
        console.error(error)
      }
    }

    fetchSingleDogData()
  }, [name])

  return (
    <>
      <section class="container d-flex align-items-center justify-content-center vh-100">
  {dog.map((item) => (
    <div key={item.id} class="row g-4 p-4 d-flex align-items-center">
      <div class="col-12 col-md-6">
        <article>
          <img
            src={`https://cdn2.thedogapi.com/images/${item.reference_image_id}.jpg`}
            alt={item.name}
            class="img-fluid rounded"
          />
        </article>
      </div>
      <div class="col-12 col-md-6">
        <article>
          <h1 class="display-4 text-white mb-4">{item.name}</h1>
          {item.description && (
            <p class="text-muted mb-4">
              {item.description}
            </p>
          )}
          <ul class="list-unstyled text-muted">
            <li>
              <span class="fw-bold text-Black">Bred For:</span> {item.bred_for}
            </li>
            <li>
              <span class="fw-bold text-Black">Height:</span> {item.height.metric} cm
            </li>
            <li>
              <span class="fw-bold text-Black">Weight:</span> {item.weight.metric} kgs
            </li>
            <li>
              <span class="fw-bold text-Black">Breed Group:</span> {item.breed_group}
            </li>
            <li>
              <span class="fw-bold text-Black">Lifespan:</span> {item.life_span}
            </li>
            <li>
              <span class="fw-bold text-Black">Temperament:</span> {item.temperament}
            </li>
          </ul>
          <Link
            to="/blog"
            class="btn btn-primary mt-4"
          >
            &larr; Back
          </Link>
        </article>
      </div>
    </div>
  ))}
</section>

    </>
  )
}
export default SingleDog;
