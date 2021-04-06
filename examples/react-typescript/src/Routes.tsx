import React, { useEffect } from 'react'
import { Route, Switch, useHistory } from 'react-router-dom'
import { useContext } from '@iniettore/react'

import Anotherpage from './pages/AnotherPage'
import HomePage from './pages/HomePage'
import Tracker from './Tracker'

export default function Routes() {
  const { tracker } = useContext<{ tracker: Tracker }>()
  const history = useHistory()

  const trackPageView = () => tracker.pageView(window.location.pathname)

  useEffect(() => {
    trackPageView()
    history.listen(trackPageView)
  }, [])

  return (
    <Switch>
      <Route path='/' exact>
        <HomePage />
      </Route>
      <Route path='/another' exact>
        <Anotherpage />
      </Route>
    </Switch>
  )
}
