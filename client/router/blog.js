const express = require('express');
const router = express.Router();

const path = require('path');
const axios = require('axios');

const parseCookie = str =>
    str.split(';').map(v => v.split('=')).reduce((acc, v) => {
        acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1].trim());
        return acc;
    }, {});

router.get('/random', (req, res) => {
    let targetURL;
    if(req.secure) {
        targetURL = `https://${req.hostname}`;
    } else {
        targetURL = `http://${req.hostname}`;
    }
    axios.post(`${targetURL}/api/account/getRandomUsername`).then(axiosRes => {
        return res.status(200).redirect(`/blog/${axiosRes.data.username}`)
    }).catch(ar => {
        console.log(ar);
        return res.status(404).send();
    });
});


router.get('/my', (req, res) => {
    const cookie = parseCookie(req.headers.cookie);

    if(!cookie.hasOwnProperty('accessToken')) return res.status(200)
        .send(`<script>alert("로그인이 필요합니다.");location.href="/login?redirect="+encodeURIComponent(location.pathname)</script>`);

    const rawPayload = cookie.accessToken.split('.')[1];
    const decoded = Buffer.from(rawPayload, 'base64').toString();
    const payload = JSON.parse(decodeURI(decoded));
    return res.status(200).redirect(`/blog/${payload.username}`);
})

router.get('/:username', (req, res) => {
    let targetURL;
    if(req.secure) {
        targetURL = `https://${req.hostname}`;
    } else {
        targetURL = `http://${req.hostname}`;
    }
    axios.post(`${targetURL}/api/blog/getBlogIDFromUsername`, {
        username: req.params.username
    }).then((axiosRes) => {
        if(!axiosRes.data.hasOwnProperty("blog_id")) {
            return res.status(404).send();
        }
        axios.post(`${targetURL}/api/blog/getBlogData`, {
            blog_id: axiosRes.data.blog_id
        }).then((post2Res) => {
            const expires = new Date;
            expires.setHours(expires.getHours() + 24)
            res.cookie('object_list', post2Res.data.object_list, expires);
            return res.status(200).sendFile(path.join(__dirname, '../public', 'blog.html'));
        })
    }).catch((axiosReason) =>{
        console.log(axiosReason);
        return res.status(404).send();
    });
});


router.get('/', (req,res) => {
    return res.status(200).sendFile(path.join(__dirname, '../public', 'blogRedirectPage.html'));
});

//
module.exports = router;