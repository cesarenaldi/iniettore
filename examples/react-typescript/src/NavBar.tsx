import React from 'react'
import { NavLink } from 'react-router-dom'

export function NavBar() {
  return (
    <div role='navigation' aria-label='Main'>
      <NavLink to='/'>Home Page</NavLink>
      <NavLink to='/another'>Another Page</NavLink>
    </div>
  )
}
