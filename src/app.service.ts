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
          <span>Please <a href="https://ntusu-api-static-prod.s3.ap-southeast-1.amazonaws.com/static/special/GlintsChallengeREADMEPDF.pdf?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjELb%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaDmFwLXNvdXRoZWFzdC0xIkYwRAIgeONxZkQqFCvyFJgL2imMl2AJJv%2BfKUgkBiCmptZ3EqECIHlYqQHdum8DMtbayS%2FJ85l2bVkx%2FGspTt6DxtTVmzvjKu0CCJ%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQBBoMMTQzOTQxNjUxNjQwIgwKxoODKGtw6aF2yQUqwQK397EAJOdZrSvT0zk7cCDXFBD0t2Mli1m2QXkZn%2FCSddcxsU72sBzJGbBqANTxBGHcNcVEddNYuj7enmd%2BYKK%2BEdaQT2WFnww7R9MeVjhBoIN4CP%2BnpYScFMOG1OOqaySMzPyf8ntAj224wHAM1Krvgelc0PdJQkZC7CTgn2%2F0AeUQj8Y4bG941BRuLQxzcH5Xbh%2F4nzd2BA2f1w4p4dIVbWi7W5qRO1BBI0BzUYA8JzV2idt8CNBor%2F4PvlEwVsd0aoLnRjdwSd2HQwE7gDAxe5U5ASZGDTSISLHep%2F7%2FvnMUjXUVOZLu83ES2Vu1WMCKl7F%2Fz8YnzooeB1DqTPBSOk7haYksiDhVByR8o9fZGVrTyzjYUfFsC5IA44p6xgxcj5rQcM7cGmAL2l9ZiNw2whLjv4y7w6vAkXHP7yuaxcAwlqnSoQY6tALUCv8g%2Bkm0hd%2FTq%2FsslmdQGFRuJoYeLj%2Btk5hJrN2gU77R5wDIWTXDIlNc9c0%2BUfax7Pqyuqp%2BJQcFFSHShanYBO4TypDd6yVPGVv8Yy55wjDWEajwj5iYerf8m4f2NgxP7ywyH4NQRoeA5T%2B8SQ%2BFLq8XgWMEDjJb2JX936rjdcRzY4eADSX2DE4H7Ax4GeTHzX0XWL1P989n2TkNcmPwWIAzoT4Bw2D2wwOAas%2FiC558P34r2GR1Nb4OXSzF7WJn7h5npR6btRYah9WzWTuEqkb%2FjqMrIr2YYaiLGYOyvsI%2FMwGkX3nUXRDkEEFNNR0420kzHfszSY%2Fq5Dvy56BbCozxmtMDI3SweNPzqdsUEjbC6WLCDIOUNOtkF2ofgRFJSBVZ5xClnsLgCZX%2BaHABBowzkA%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230411T062727Z&X-Amz-SignedHeaders=host&X-Amz-Expires=300&X-Amz-Credential=ASIASDA4XJS4BSDWGH3A%2F20230411%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Signature=281ffdec706e650c2534b8fdd5f857adbcfc7b0c08875692b4a4e9be44c34787" target="_blank">click here to see README.md</a> for the detailed project overview, tech stack and tools used here, including database schema and complete API documentation, plus test cases I made.</span>
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
