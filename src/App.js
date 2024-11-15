import React, {Component} from 'react';
import './App.css';
import Particles from './components/Particles/Particles';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';

const returnClarifaiRequestOptions = (imageUrl) => {
    // Your PAT (Personal Access Token) can be found in the Account's Security section
    const PAT = '38b2d86dca794903889bae71dc7b7c4b';
    // Specify the correct user_id/app_id pairings
    // Since you're making inferences outside your app's scope
    const USER_ID = 'sojinnie23';       
    const APP_ID = 'Facebrain';
    // Change these to whatever model and image URL you want to use
    /* const MODEL_ID = 'face-detection';  */   
    const IMAGE_URL = imageUrl;
    /* const MODEL_ID = 'face-detection';
    const MODEL_VERSION_ID = '6dc7e46bc9124c5c8824be4822abe105'; */

    const raw = JSON.stringify({
      "user_app_id": {
          "user_id": USER_ID,
          "app_id": APP_ID
      },
      "inputs": [
          {
              "data": {
                  "image": {
                      "url": IMAGE_URL
                  }
              }
          }
      ]
    });

    const requestOptions = {
    method: 'POST',
    headers: {
        'Accept': 'application/json',
        'Authorization': 'Key ' + PAT
    },
    body: raw
    };
    return requestOptions
  };

class App extends Component {

    constructor(input) {

        super(input);
        this.state = {
          input: '',
          imageUrl: '',
          box: {},
          route: 'signin',
          isSignedIn: false,
          user: {
            id: '',
            name: '',
            email: '',
            entries: 0,
            joined: ''
          }
  
        }
      }

      loadUser = (data) => {
        this.setState({user: {
          id: 'data.id',
          name: 'data.name',
          email: 'data.email',
          entries: 'data.entries',
          joined: 'data.joined'
      }})
      }

      componentDidMount() {
        fetch('http://localhost:3000')
        .then(response => response.json())
        .then(console.log)
      }

    calculateFaceLocation = (data) => {
      const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
      const image = document.getElementById('inputImage');
      const width = Number(image.width);
      const height = Number(image.height);
      
      // Adjust calculations to make the bounding box more accurate
      return {
        topRow: clarifaiFace.top_row * height * 0.90,     // Slightly reduce the top row
        leftCol: clarifaiFace.left_col * width * 0.90,    // Slightly reduce the left column
        bottomRow: height - (clarifaiFace.bottom_row * height * 0.90), // Slightly increase the bottom row
        rightCol: width - (clarifaiFace.right_col * width * 0.90) // Slightly increase the right column
      };
  }

    displayFaceBox = (box) => {
        this.setState({box: box});
    }

    onInputChange = (event) => {
      this.setState({input: event.target.value});
    }

    onSubmit = () => {
      this.setState({imageUrl: this.state.input});
      const MODEL_ID = 'face-detection';

      fetch("https://api.clarifai.com/v2/models/" + MODEL_ID + "/outputs", returnClarifaiRequestOptions(this.state.input))
    .then(response => response.json())
    .then(response => {
    if (response) {
      fetch("http://localhost:3000/image", {
        method: 'put',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: this.state.user.name,
          entries: this.state.user.entries + 1
        })
      })

      .then(response => response.json())
      .then(count => {
        this.setState(Object.assign(this.state.user, {entries: count}));
        })
    }})

  .then(result => {
    const regions = result.outputs[0].data.regions;
    
    // If there's at least one face detected, process the first bounding box
    if (regions && regions.length > 0) {
      const boundingBox = regions[0].region_info.bounding_box;
      const box = {
        topRow: boundingBox.top_row * 100,
        leftCol: boundingBox.left_col * 200,
        bottomRow: boundingBox.bottom_row * 100,
        rightCol: boundingBox.right_col * 200
      };
      this.displayFaceBox(box); // Update state to display this box
    }
    
    // Log details for each region (optional)
    regions.forEach(region => {
      const boundingBox = region.region_info.bounding_box;
      const topRow = boundingBox.top_row.toFixed(3);
      const leftCol = boundingBox.left_col.toFixed(3);
      const bottomRow = boundingBox.bottom_row.toFixed(3);
      const rightCol = boundingBox.right_col.toFixed(3);
      
      region.data.concepts.forEach(concept => {
        const name = concept.name;
        const value = concept.value.toFixed(4);
        console.log(`${name}: ${value} BBox: ${topRow}, ${leftCol}, ${bottomRow}, ${rightCol}`);
      });
    });
  })
  .catch(error => console.log('error', error));
    }

    onRouteChange = (route) => {
  if (route === 'signout') {
    this.setState({isSignedIn: false})
  } else if (route === 'home') {
    this.setState({isSignedIn: true})
  }
  this.setState({route: route});
    }

render() {
  const { isSignedIn, imageUrl, route, box } = this.state;
  return (
    <div className="App">
    <Particles className='particles' />
    <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
    { route === 'home'
      ? <div>
          <Logo />
          <Rank
            /* name={this.state.user.name}
            entries={this.state.user.entries} */
          />
          <ImageLinkForm
            onInputChange={this.onInputChange}
            onSubmit={this.onSubmit}
          />
          <FaceRecognition box={box} imageUrl={imageUrl} />
        </div>
      : (
         route === 'signin'
         ? <SignIn onRouteChange={this.onRouteChange}/>
         : <Register loadUser ={this.loadUser} onRouteChange={this.onRouteChange}/>
        )
    }
  </div>
);
}
}


export default App;
