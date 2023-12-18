import React, { useState } from "react";

// Import everything needed to use the `useQuery` hook
import { ApolloClient, InMemoryCache, ApolloProvider, gql, useQuery, HttpLink } from '@apollo/client';

//https://medium.com/dutchak/managing-multiple-graphql-endpoints-in-a-single-application-9dbdc4a804a5
const createApolloClient = (uri) => new ApolloClient({
  link: new HttpLink({ uri }),
  cache: new InMemoryCache(),
});


// Multiple apollo clients
const dogClient = createApolloClient('https://71z1g.sse.codesandbox.io/');
const localhostClient = createApolloClient('http://localhost:5000');


export default function App() {

  const [selectedDog, setSelectedDog] = useState(null);

  function onDogSelected({ target }) {
    setSelectedDog(target.value);
  }
  return (
    <div>
      <ApolloProvider client={localhostClient}>
        <div>
          <h2>Libraries</h2>        
          <Libraries />
        </div>
      </ApolloProvider>
      <ApolloProvider client={dogClient}>
      <div>
        <h2>Building Query components 🚀</h2>
        {selectedDog && <DogPhoto breed={selectedDog} />}
        <Dogs onDogSelected={onDogSelected} />
      </div>
    </ApolloProvider>
  </div>
  );
}

// Libraries components and functions
const GET_LIBRARIES = gql`
  query libraries {
    libraries {
      branch, 
      books { 
        title, 
        author {
          name
        }
      }
    }
  }
`;

function Libraries() {
  const { loading, error, data } = useQuery(GET_LIBRARIES);

  if (loading) return 'Loading...';
  if (error) return `Error! ${error.message}`;

  return ( 
      <div>
        Libraries :   
        <ul>
        {data.libraries.map((LibraryItem) => (
          <li>{LibraryItem.branch}
            <ul>
            {LibraryItem.books.map((bookItem) => (
              <li>{bookItem.title}</li>
            ))}
            </ul>
          </li>
        ))}

      </ul>
    </div> 
  );
}


// Dog components and functions
const GET_DOGS = gql`
  query GetDogs {
    dogs {
      id
      breed
    }
  }
`;

const GET_DOG_PHOTO = gql`
  query Dog($breed: String!) {
    dog(breed: $breed) {
      id
      displayImage
    }
  }
`;


function Dogs({ onDogSelected }) {
  const { loading, error, data } = useQuery(GET_DOGS);

  if (loading) return 'Loading...';
  if (error) return `Error! ${error.message}`;

  return (
    <select name='dog' onChange={onDogSelected}>
      {data.dogs.map((dog) => (
        <option key={dog.id} value={dog.breed}>
          {dog.breed}
        </option>
      ))}
    </select>
  );
}

function DogPhoto({ breed }) {
  const { loading, error, data } = useQuery(GET_DOG_PHOTO, {
    variables: { breed },
  });

  if (loading) return null;
  if (error) return `Error! ${error}`;

  return (
    <img src={data.dog.displayImage} style={{ height: 100, width: 100 }} />
  );
}
