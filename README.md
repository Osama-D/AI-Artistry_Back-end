# AI-Artistry

![behance](https://github.com/Osama-D/AI-Artistry_Back-end/assets/99812352/32d70a83-d314-4021-aca4-c99a366c2c63)

Welcome to AI-Artistry, a web application that utilizes OpenAI's DALL-E AI to generate unique images based on user prompts. This project aims to showcase the capabilities of AI image generation and provide users with a platform to generate and share their own creations.

## Table of Contents

- [Features](#features)
- [Demo](#demo)
- [Installation](#installation)
- [Usage](#usage)
- [Technologies](#technologies)
- [License](#license)

## Features

AI-Artistry offers the following features:

- **Image Generation**: Users can input prompts, and the DALL-E AI will generate unique images based on those prompts.
- **Showcase**: Users can share their generated images with others through the platform's showcase feature.
- **Infinite Scrolling**: The website implements infinite scrolling, allowing users to continuously load more images as they scroll down.
- **Smooth Scrolling**: Framer Motion is used to achieve smooth scrolling, enhancing the user experience.
- **Slider**: Swiper is implemented to provide a seamless experience for browsing through the generated images.

## Demo

Check out our Behance page at [Behance](https://www.behance.net/gallery/164648805/AI-Image-Generator-Website-UI-Development) to see a visual showcase of AI-Artistry in action.

You can also visit the live website at [AI-Artistry](https://ai-artistry.vercel.app) to explore the image generation and showcase features.

## Installation

To run AI-Artistry locally, you need to connect the front-end with the backend. Follow these steps:

1. Clone the front-end repository: git clone https://github.com/Osama-D/AI-Artistry_Front-end.git
2. Clone the backend repository: git clone https://github.com/Osama-D/AI-Artistry_Back-end.git
3. Install the dependencies for the front-end and the backend:

- Front-end:
   
    ```
    cd AI-Artistry_Front-end
    ```

    ```
    npm install
    ```
    
- Back-end:
    
    ```
    cd AI-Artistry_Back-end
    ```

    ```
    npm install
    ```

4. Start the development server for the front-end and the backend:

- Front-end:
    
    ```
    npm run dev
    ```
    
- Back-end:
    
    ```
    npm run start
    ```

The website should now be accessible at `http://localhost:3000`, and it will be connected to the backend server running on `http://localhost:5000`.

Please ensure that both the front-end and backend servers are running simultaneously for the website to work correctly.

## Usage

Once you have both the front-end and backend servers running, you can follow the usage instructions to generate and share images using AI-Artistry. Here's a brief guide:

1. On the generate page, enter your prompt in the designated input field.
2. Click the "Generate" button to trigger the DALL-E AI and generate an image based on your prompt.
3. View the generated image and click the "Share" button to add it to the showcase.
4. Scroll down or jump to home page to explore the showcase and view images shared by other users.

Feel free to experiment with different prompts and generate your own unique images!

## Technologies

AI-Artistry is built using the following technologies:

- Front-end: Next.js (React framework)
- Back-end: Node.js with Express
- Database: Appwrite
- Image hosting: Cloudinary
- Server-Side Rendering (SSR) for SEO optimization

## License

AI-Artistry is released under the MIT License. See [LICENSE](LICENSE) for more information.

Thank you for your interest in AI-Artistry! I hope you enjoy exploring the possibilities of AI image generation.
