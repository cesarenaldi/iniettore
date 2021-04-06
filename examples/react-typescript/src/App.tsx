import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { Container } from '@iniettore/react'

import { describe } from './modules'
import Routes from './Routes'
import { NavBar } from './NavBar'

export default function App() {
  return (
    <Container describe={describe}>
      <BrowserRouter>
        <NavBar />
        <Routes />
      </BrowserRouter>
    </Container>
  )
}
