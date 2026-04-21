import { useState } from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'
import './App.css'

function Home() {
  return (
    <section className="page">
      <h1>Welcome</h1>
      <p>Navigate the app to learn more and reach out.</p>
    </section>
  )
}

function About() {
  return (
    <section className="page">
      <h1>About</h1>
      <p>This demo shows simple client-side routing with a controlled contact form.</p>
    </section>
  )
}

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    console.log('Contact form submitted:', formData)
    setFormData({ name: '', email: '', message: '' })
  }

  return (
    <section className="page">
      <h1>Contact</h1>
      <p>Send a quick note and we will get back to you.</p>
      <form className="contact-form" onSubmit={handleSubmit}>
        <label>
          <span>Name</span>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          <span>Email</span>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          <span>Message</span>
          <textarea
            name="message"
            rows="4"
            value={formData.message}
            onChange={handleChange}
            required
          ></textarea>
        </label>
        <button type="submit">Send message</button>
      </form>
    </section>
  )
}

function App() {
  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">Task 4</div>
        <nav className="nav">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </nav>
      </header>

      <main className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
