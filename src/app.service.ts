import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    // alternatively can use hbs for mvc format
    // as this is just a small example, it's tolerable to just do this
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Glints Technical Assignment (Backend)</title>
      <style>
        body {
          font-family: 'Roboto', sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f9f9f9;
        }
        .container {
          max-width: 960px;
          margin: 0 auto;
          padding: 20px;
          box-sizing: border-box;
        }
        h1 {
          font-size: 36px;
          margin-bottom: 10px;
        }
        h4 {
          font-size: 16px;
          font-weight: 600;
          color: #0066cc;
        }
        h3 {
          font-size: 20px;
          margin-bottom: 10px;
          color: #999;
        }
        p {
          font-size: 18px;
          line-height: 1.6;
          margin-bottom: 20px;
          color: #333;
        }
        p a {
          color: #0066cc;
          text-decoration: none;
          transition: color 0.2s ease-in-out;
        }
        p a:hover,
        p a:focus {
          color: #004e9a;
          text-decoration: underline;
        }
        p span {
          display: block;
          margin-bottom: 10px;
        }
        p span.bold {
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1><u>Glints Technical Assignment (Backend)</u></h1>
        <h3>by Michael Andrew Chan</h3>
        <h4>Version 1.3</h4>
        <p>
          <span>Thank you for looking through my assignment, made based on <a href="https://gist.github.com/seahyc/97b154ce5bfd4f2b6e3a3a99a7b93f69" target="_blank">this brief</a>.</span>
          <span>I am okay to work for both backend and frontend, and am excited to work as software engineer intern at Glints.</span>
          <span>I hope you can see my passion and technical competencies through this assignment.</span>
          <span>Please <a href="#TODO" target="_blank">click here to see README.md</a> for the detailed project overview, tech stack and tools used here, including database schema and complete API documentation, plus test cases I made.</span>
          <span>Feel free to contact me through my email <b>mich0107@e.ntu.edu.sg</b> or phone <b>94289104</b> for further discussion.</span>
          <span>The repository <a href="https://github.com/michac789/michael-andrew-chan-backend-07Apr2023" target="_blank">here</a> is currently made private, you can message me to invite you to the repository (so you can see my code).</span>
          <span>Thank you and looking forward to the next steps.</span>
        </p>
      </div>
    </body>
    </html>
    `;
  }
}
