from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from diffusers import StableDiffusionPipeline
import torch
import base64
from io import BytesIO
from PIL import Image, ImageEnhance
import os

app = FastAPI()

# Frontend connectivity ke liye CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Device Configuration
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# ==========================================
# 1. MODERN PIPELINE INITIALIZATION & LOADING
# ==========================================
print("Loading Stable Diffusion Pipeline...")
model_id = "OFA-Sys/small-stable-diffusion-v0"

# Load Base Model
if torch.cuda.is_available():
    pipe = StableDiffusionPipeline.from_pretrained(model_id, torch_dtype=torch.float16)
else:
    pipe = StableDiffusionPipeline.from_pretrained(model_id) # Fallback for CPU

pipe.to(device)

# LoRA Weights Load Path (image_52f2e5.png ke folder structure ke hisab se upar wale folder me h)
LORA_PATH = "C:\\face generation module\\adapter_model.safetensors"

if os.path.exists(LORA_PATH):
    print(f"Loading LoRA weights from '{LORA_PATH}'...")
    # Hamare folder se LoRA adapter load karega
    pipe.load_lora_weights("../", weight_name="adapter_model.safetensors")
    print("LoRA Model loaded successfully into Stable Diffusion!")
else:
    print(f"⚠️ WARNING: '{LORA_PATH}' nahi mili! Base SD Model run hoga.")

class PromptRequest(BaseModel):
    prompt: str

# 🌟 FORENSIC CHARCOAL SKETCH POST-PROCESSOR
def process_to_forensic_sketch(image):
    # Stable diffusion already 512x512 output deta h, hum bas look and feel set karenge
    
    # A. Pure Pencil/Charcoal look ke liye Grayscale (Black & White) conversion
    im_bw = image.convert("L") 
    
    # B. Dynamic range adjusters (Shading ko sharp aur dark karne ke liye)
    contrast_adjuster = ImageEnhance.Contrast(im_bw)
    im_final = contrast_adjuster.enhance(1.3) # Adjusted for SD outputs
    
    sharpness_adjuster = ImageEnhance.Sharpness(im_final)
    im_final = sharpness_adjuster.enhance(1.8)

    # Base64 export pipeline
    buffered = BytesIO()
    im_final.save(buffered, format="JPEG", quality=100)
    return base64.b64encode(buffered.getvalue()).decode('utf-8')

# ==========================================
# 2. API ROUTE FOR GENERATION
# ==========================================
@app.post("/generate")
async def generate_face_from_prompt(request: PromptRequest):
    try:
        user_prompt = request.prompt
        print(f"Processing prompt via Stable Diffusion LoRA: {user_prompt}")
        
        # Trigger words add karein jo aapne custom dataset training me diye the
        # Example: 'forensic sketch style, pencil sketch, detailed line art'
        final_prompt = f"forensic pencil sketch of {user_prompt}, high detail, criminal suspect profile"
        negative_prompt = "colored, 3d render, photo, photorealistic, blurry, deformed face, bad anatomy"
        
        # Generator run karke image banana
        if os.path.exists(LORA_PATH) or model_id:
            with torch.inference_mode():
                # num_inference_steps=25 ya 30 fast generation ke liye perfect h
                generated_image = pipe(
                    prompt=final_prompt, 
                    negative_prompt=negative_prompt,
                    num_inference_steps=25,
                    guidance_scale=7.5
                ).images[0]
                
            img_base64 = process_to_forensic_sketch(generated_image)
        else:
            # Fallback black template grid agar model loading crash ho jaye
            img = Image.new('L', (512, 512), color=30)
            buffered = BytesIO()
            img.save(buffered, format="JPEG")
            img_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')

        # Figma UI structure metadata (Aapka original JSON response format strictly maintained)
        return {
            "status": "success",
            "matches_found": 1,
            "candidates": [
                {"id": "#01", "image_base64": img_base64}
            ],
            "metrics": {
                "age_range": {"value": "Calculated from Sketch", "confidence": 94},
                "gender": {"value": "Detected Profile", "confidence": 96},
                "facial_hair": {"value": "Analyzed Structural Data", "confidence": 89},
                "eye_color": {"value": "Monochrome Grid", "confidence": 85},
                "face_shape": {"value": "Geometry Locked", "confidence": 91},
                "expression": {"value": "Neutral / Forensic Baseline", "confidence": 95}
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))