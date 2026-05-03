import fs = require('fs');
import path = require('path');

const POSTS_FILE = path.join(__dirname, '../../data/posts.json');

export function loadPosts(){
    const data = fs.readFileSync(POSTS_FILE, 'utf-8');
    return JSON.parse(data);
}

export function savePost(post: any){
    const posts = loadPosts();
    posts.push(post);
    fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2));
}