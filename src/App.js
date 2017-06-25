import React, { Component } from 'react';
import FileUpload from './FileUpload.js';
import logo from './logo.svg';
import './App.css';

export default class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
        </div>
        <div className="App-intro">

          { /* Specify parentId, urploadUrl and removeUrl with yours below: */ }
          <FileUpload
            parentId="1"
            uploadUrl="../UploadAttachment" 
            removeUrl="../RemoveAttachment"
            accept=".doc,.docx,.xls,.xlsx,.pdf,.ppt,.pptx,.txt"
            attachments={[]}
            addNotification={(message, isError) => isError ? console.error(message) : console.log(message)} />

        </div>
      </div>
    );
  }
}

