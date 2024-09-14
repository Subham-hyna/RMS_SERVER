const userCredentialsTemplate = (name, email, saleId, password, loginLink) => {
    return `
    <!DOCTYPE html>
      <html>
      <head>
          <style>
              .restura-logo{
                  display: flex;
                  align-items: center;
                  gap: 6px;
              }
              .restura-logo p{
                font-size: 1.5rem;
                font-weight: 600;
                color: #604BE8;
            }
              .restura-logo img{
                  width: 2rem;
                  height: 2rem;
              }
             .box{
                background-color: #f9f8fb;
              width: 70%;
              padding: 50px;
              font-family: "Poppins", sans-serif;
             }
             .box>h1{
              margin: 0 auto;
              display: flex;
              justify-content: center;
              font-size: 35px;
              color: #2D00A3;
              font-weight: 500;
             }
             .box>h3{
              font-size:18px;
              font-weight: bold;
              color: #606060;
             }
             .box>a{
              width: 200px;
              background-color: #4CAF50;
              padding: 15px;
              display: flex;
              justify-content: center;
              align-items: center;
              text-decoration: none;
             }
             .box>a:hover{
              background-color: #388E3C;
              cursor: pointer;
             }
             .box>p{
              font-size: 16px;
              color: #606060;
             }
             .box>a>button{
              outline: none;
              border: none;
              background-color: inherit;
              color: #FFFFFF;
              font-size: 16px;
              margin: 0 auto;
             }
             .box>span{
              margin: 0 auto;
              display: flex;
              justify-content: center;
              font-size: 14px;
              color: #CCCCCC;
             }
          </style>
      </head>
      <body>
          <div class="box">
              <div class="restura-logo">
              
              <p>Restura</p>
              </div>
              <h1>Account Created!</h1>
              <p>Hello, ${name}</p>
              <p>Your account for managing the restaurant has been successfully created. Here are your credentials:</p>
              <h3>Email ID - <span>${email}</span></h3>
              <h3>Sale ID - <span>${saleId}</span></h3>
              <h3>Temporary Password - <span>${password}</span></h3>
              <p>Click below to log in and start managing your restaurant:</p>
              <a href=${loginLink}><button>Login</button></a>
              <p>Please change your password after your first login.</p>
              <span>Best Regards, Restura Team 🍽️</span>
          </div>
      </body>
      </html>
    `
}

export default userCredentialsTemplate;