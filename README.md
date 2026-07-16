
  # Design  Face Sketch Generator

 # Design Witness Face Generator 🕵️‍♂️🎨

A forensic AI-powered system designed to generate accurate suspect profiles from witness verbal descriptions. This tool leverages Stable Diffusion to transform descriptive prompts into detailed pencil sketches.

## 🚀 Key Features
* **AI-Powered Sketch Generation:** Generates forensic-style pencil sketches using custom Stable Diffusion pipelines.
* **Optimized Inference:** Configured for 25-30 inference steps for high-fidelity, accurate facial details.
* **Direct Local Integration:** Optimized for local high-speed communication between React frontend and FastAPI backend (bypassing unstable tunneling).
* **Forensic-Focused Prompting:** Tailored negative prompts to ensure anatomical correctness and avoid cartoonish/photo-realistic outputs.

## 🛠 Tech Stack
| Layer | Technology |
| :--- | :--- |
| **Frontend** | React, Vite, TypeScript, TailwindCSS |
| **Backend** | Python, FastAPI, Uvicorn |
| **AI/ML** | Stable Diffusion, Diffusers (Hugging Face), PyTorch |

## ⚙️ Getting Started

# Design Witness Face Generator 🕵️‍♂️🎨

A forensic AI-powered system designed to generate accurate suspect profiles from witness verbal descriptions. This tool leverages Stable Diffusion to transform descriptive prompts into detailed pencil sketches.

## 🚀 Key Features
* **AI-Powered Sketch Generation:** Generates forensic-style pencil sketches using custom Stable Diffusion pipelines.
* **Optimized Inference:** Configured for 25-30 inference steps for high-fidelity, accurate facial details.
* **Direct Local Integration:** Optimized for local high-speed communication between React frontend and FastAPI backend (bypassing unstable tunneling).
* **Forensic-Focused Prompting:** Tailored negative prompts to ensure anatomical correctness and avoid cartoonish/photo-realistic outputs.

## 🛠 Tech Stack
| Layer | Technology |
| :--- | :--- |
| **Frontend** | React, Vite, TypeScript, TailwindCSS |
| **Backend** | Python, FastAPI, Uvicorn |
| **AI/ML** | Stable Diffusion, Diffusers (Hugging Face), PyTorch |

## ⚙️ Getting Started

### 1. Backend Setup
Ensure you have Python installed and the necessary libraries.
```bash
# Start the backend server
uvicorn app:app --reload --timeout-keep-alive 900
Ensure you have Python installed and the necessary libraries.
```bash
# Start the backend server
uvicorn app:app --reload --timeout-keep-alive 900

### 2. Frontend Setup
Navigate to the frontend directory, install dependencies, and start the development server.

```bash
# Install dependencies
npm install

# Start the Vite development server
npm run dev
  
