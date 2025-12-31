# from huggingface_hub import HfApi

# api = HfApi()
# files = api.list_repo_files("prod-IQ/PROD-IQ-Dataset", repo_type="dataset")
# # Filter for paths starting with "models/"
# models_paths = [p for p in files if p.startswith("models/")]
# print(models_paths)

from huggingface_hub import snapshot_download

# snapshot_download(
#     repo_id="prod-IQ/PROD-IQ-Dataset",
#     repo_type="dataset",
#     local_dir="hf_repo"
# )

snapshot_download(
    repo_id="prod-IQ/PROD-IQ-Dataset",
    repo_type="dataset",
    allow_patterns="models/**",
    local_dir="models_only"
)
print("Model files downloaded successfully.")
exit()



