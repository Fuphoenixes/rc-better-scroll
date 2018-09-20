import React, { Component } from 'react';
import './App.css';
import Scroll from 'rc-better-scroll'

const timeout = (delay)=>{
	return new Promise((resolve, reject)=>{
		setTimeout(()=>{
			resolve();
		},delay)
	})
};


class App extends Component {

	pullDownFreshAction = async ()=>{
	  await timeout(1000)
  };

	loadMoreData = async ()=>{
		await timeout(1000)
  };


  render() {
    return (
	    <div className='list'>
		    <Scroll
			    pullDownRefresh={this.pullDownFreshAction}
			    pullUpLoad={this.loadMoreData}
		    >
			    <ul>
				    <li>aaaaaasdadwd</li>
				    <li>aaaaaasdadwd</li>
				    <li>aaaaaasdadwd</li>
				    <li>aaaaaasdadwd</li>
				    <li>aaaaaasdadwd</li>
				    <li>aaaaaasdadwd</li>
				    <li>aaaaaasdadwd</li>
				    <li>aaaaaasdadwd</li>
				    <li>aaaaaasdadwd</li>
				    <li>aaaaaasdadwd</li>
				    <li>aaaaaasdadwd</li>
				    <li>aaaaaasdadwd</li>
				    <li>aaaaaasdadwd</li>
				    <li>aaaaaasdadwd</li>
				    <li>aaaaaasdadwd</li>
				    <li>aaaaaasdadwd</li>
				    <li>aaaaaasdadwd</li>
				    <li>aaaaaasdadwd</li>
				    <li>aaaaaasdadwd</li>
				    <li>aaaaaasdadwd</li>
				    <li>aaaaaasdadwd</li>
				    <li>aaaaaasdadwd</li>
				    <li>aaaaaasdadwd</li>
				    <li>aaaaaasdadwd</li>
				    <li>aaaaaasdadwd</li>
			    </ul>
		    </Scroll>
	    </div>
    );
  }
}

export default App;
