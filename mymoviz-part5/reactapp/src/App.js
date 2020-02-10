import React, {useState, useEffect} from 'react';
import './App.css';
import { 
  Container,
  Row,
  Button,
  Nav,
  NavItem,
  NavLink,
  Popover,
  PopoverHeader,
  PopoverBody,
  ListGroup,
  ListGroupItem,
  ListGroupItemText,

 } from 'reactstrap';

import Movie from './components/Movie'




function App() {

  const [moviesCount,setMoviesCount] = useState(0)
  const [moviesWishList, setMoviesWishList] = useState([])
  const [movieList, setMovieList] = useState([])

  const [popoverOpen, setPopoverOpen] = useState(false);

  const toggle = () => setPopoverOpen(!popoverOpen);

  ///// Fonction qui va appliquer des traitements soit à l’initialisation , la modification ou destruction.
  useEffect(async () => {

    // récupère la liste des films :
    const response = await fetch('/new-movies')
    const jsonResponse = await response.json()
    //console.log(jsonResponse)
    setMovieList(jsonResponse.movies)

    // on récupère les films de la wishlist et les charger :
    const responseWish = await fetch('wishlist-movie')
    const jsonResponseWish = await responseWish.json()

    // Ppour chaque film de la wishList on récuère le nom et l'img :
    const wishlistFromDB = jsonResponseWish.movies.map((movie,i) => {
      return {name:movie.movieName, img:movie.movieImg}         // movieName est la propriété du shéma
    })

    setMoviesWishList(wishlistFromDB)
    setMoviesCount(jsonResponseWish.movies.length)

  }, [])
  ///////////////////////////////////

  ////// Ajouter un film :
  var handleClickAddMovie = async (name, img) => {
    setMoviesCount(moviesCount+1)
    setMoviesWishList([...moviesWishList, {name:name,img:img}])

    // rajoute ce film dans le backend :
    const response = await fetch('/wishlist-movie', {
      method: 'POST',
      headers: {'Content-Type':'application/x-www-form-urlencoded'},
      body: `name=${name}&img=${img}`
    })
  }

  ////// Supprimer un film :
  var handleClickDeleteMovie = async (name) => {
    setMoviesCount(moviesCount-1)
    setMoviesWishList(moviesWishList.filter(object => object.name != name))

    const response = await fetch(`/wishlist-movie/${name}`, {
      method: 'DELETE'
    })
  }

  ////// Map sur moviesWishList pour effectuer une action sur chaque rangée :
  var cardWish = moviesWishList.map((movie,i) => {
    return (
      <ListGroupItem>
        <ListGroupItemText onClick={() => {handleClickDeleteMovie(movie.name)}}>
        <img width="25%" src={movie.img} /> {movie.name}
        </ListGroupItemText>
      </ListGroupItem>
    )
  })

  
  /////// Créer les propriétés pour Movie :
  var movieListItems = movieList.map((movie,i) => {
    var result = moviesWishList.find(element => element.name == movie.title)
    var isSee = false
    if(result != undefined){
      isSee = true
    }

    var result = movie.overview
    if(result.length > 80){
      result = result.slice(0,80)+'...'
    }

    // si on ne récupère pas d'image de l'API, on en met une par defaut :
    var urlImage = '/generique.jpg'
    if(movie.backdrop_path != null){
      urlImage = 'https://image.tmdb.org/t/p/w500/'+movie.backdrop_path
    }

    // On donne le nom des proprités à passer et à rcupérer en probs ex : handleClickDeleteMovieParent
    return(<Movie key={i} movieSee={isSee} handleClickDeleteMovieParent={handleClickDeleteMovie} 
      handleClickAddMovieParent={handleClickAddMovie} movieName={movie.title} 
      movieDesc={result} movieImg={urlImage} globalRating={movie.popularity} 
      globalCountRating={movie.vote_count} />)
  })

  return (
    <div style={{backgroundColor:"#232528"}}>
      <Container>
        <Nav>
          <span className="navbar-brand">
            <img src="./logo.png" width="30" height="30" className="d-inline-block align-top" alt="logo" />
          </span>
          <NavItem>
            <NavLink style={{color:'white'}}>Last Releases</NavLink>
          </NavItem>
          <NavItem>
            <NavLink>
              <Button id="Popover1"  type="button">{moviesCount} films</Button>
              <Popover placement="bottom" isOpen={popoverOpen} target="Popover1" toggle={toggle}>
                <PopoverHeader>WishList</PopoverHeader>
                <PopoverBody>
                <ListGroup>
                {cardWish}
                </ListGroup>
                </PopoverBody>
              </Popover>
            </NavLink>
          </NavItem>
        </Nav>
        <Row>
          {movieListItems}
        </Row>
      </Container>
    </div>
  );
}

export default App;
