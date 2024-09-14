const passwordResetMail = (name , resetLink) => {
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
            font-size: 30px;
            color: #2D00A3;
            font-weight: 500;
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
           .box>p:nth-child(1){
            font-weight: 600;
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
            color: #a7adb6;
           }
        </style>
    </head>
    <body>
        <div class="box">
            <div class="restura-logo">
           
            <p>Restura</p>
            </div>
            <h1>Password Reset</h1>
            <p>Hello, ${name}</p>
            <p>It seems you have requested to reset your password for your Restura account. Click below to reset your password:</p>
            <a href=${resetLink}><button>Reset My Password</button></a>
            <p>If this wasn’t you, please ignore this email.</p>
            <span>Love from Restura Team 🍴</span>
        </div>
    </body>
    </html>
`
};

export { passwordResetMail };

