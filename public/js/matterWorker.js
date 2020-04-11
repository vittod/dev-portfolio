'use strict';

self.onmessage = (evt) => console.log(evt.data);

self.postMessage('hi');
