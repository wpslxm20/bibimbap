const express = require('express');
const router = express.Router();

const client = require('../../config/db.config.js');

router.get("/:id", (req, res) => {
    const blog_id = req.params.id;
    const queryGetPostList = 'SELECT a.* FROM post AS a INNER JOIN blog AS b ON b.blog_id = $1 AND a.user_id = b.user_id;'
    client.query(queryGetPostList, [blog_id], (err, rows) => {
        if(err) return res.status(404).send({msg: "데이터베이스 오류 - Block 1"})
        else {
            //쿼리 결과가 있다면
            if(rows.rows.length){
                return res.status(200).json(rows.rows);
            }
            else{
                return res.status(200).json({msg:"null"})
            }
            
        }
    })
});

module.exports = router;