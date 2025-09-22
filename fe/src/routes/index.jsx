import { Route } from "react-router-dom";
import routeList from "./routeList";

export default routeList.map(route => {
  return (

    <Route path={route.path} element={route.page} />
  )
})