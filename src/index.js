import axios from 'axios';

// async function index() {
//   await
// }

// Promise
axios.get('http://localhost:3000/posts').then(res => {
  res.data.forEach(post => {
    // 동적으로 엘리먼트를 만들때
    // 모두 이런식으로 자바스크립트로 만들어주면 굉장히 불편함

    // 서버 측 자바스크립트로 전통적 웹 개발에서는 ejs를 사용했다.
    // 프론트 단에서는 template태그를 사용할 것이다.
    // const pEl = document.createElement('p');

    // 최신 웹브라우저에서 지원하는 template을 사용
    const fragment = document.importNode(document.querySelector('#post-item').content, true);
    const pEl = fragment.querySelector('.post-item__title');
    pEl.textContent = post.title;
    document.querySelector('.post-list').appendChild(fragment);
  });
});