import React from 'react';
import './FaceRecognition.css';

const boundingbox = 'boundingbox';

const FaceRecognition = ({ imageUrl, box }) => {
  return (
    <div className='center ma'>
      <div className='absolute mt2'>
        <img id='inputImage' alt='' src={imageUrl} width='500px' heigh='auto'/>
        <div className={boundingbox} style={{top: box.topRow, left: box.leftCol, bottom: box.bottomRow, right: box.rightCol }}></div>
      </div>
    </div>
  );
}

export default FaceRecognition;