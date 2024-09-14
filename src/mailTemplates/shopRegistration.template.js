const shopRegistrationTemplate = (name, shopName) => {
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
           .box>h3>span{
            font-size: 18px;
            color: #000000;
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
            <h1>Restaurant Registered!</h1>
            <p>Hello, ${name}</p>
            <p>Your restaurant <strong>${shopName}</strong> has been successfully registered in our system.</p>
            <span>Best Regards, Restura Team 🍽️</span>
        </div>
    </body>
    </html>
    `
}

export default shopRegistrationTemplate;