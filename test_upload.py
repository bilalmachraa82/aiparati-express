#!/usr/bin/env python3
"""
Test script to verify the API endpoints
"""
import requests
import json
import os

API_BASE = "http://localhost:8001"

def test_health():
    """Test health endpoint"""
    response = requests.get(f"{API_BASE}/health")
    print(f"Health: {response.status_code} - {response.json()}")

def test_upload():
    """Test file upload endpoint"""
    # Check if test PDF exists
    pdf_path = "IES - 2023.pdf"
    if not os.path.exists(pdf_path):
        print(f"Test PDF not found: {pdf_path}")
        return

    # Prepare file upload with auth token
    headers = {'Authorization': 'Bearer testtoken123'}
    with open(pdf_path, 'rb') as f:
        files = {'file': (pdf_path, f, 'application/pdf')}
        data = {
            'nif': '123456789',
            'ano_exercicio': '2023',
            'designacao_social': 'Empresa Teste Lda.',
            'email': 'test@example.com'
        }

        print("Uploading file...")
        response = requests.post(f"{API_BASE}/api/upload", files=files, data=data, headers=headers)
        print(f"Upload: {response.status_code} - {response.json()}")

        if response.status_code == 200:
            task_id = response.json().get('task_id')
            if task_id:
                check_status(task_id)

def check_status(task_id):
    """Check processing status"""
    import time
    print(f"\nChecking status for task: {task_id}")
    headers = {'Authorization': 'Bearer testtoken123'}

    for i in range(30):  # Check for 30 seconds max
        response = requests.get(f"{API_BASE}/api/status/{task_id}", headers=headers)
        if response.status_code == 200:
            status = response.json()
            print(f"Status check {i+1}: {status['status']} - {status.get('message', '')}")

            if status['status'] == 'completed':
                get_result(task_id)
                break
            elif status['status'] == 'failed':
                print(f"Processing failed: {status.get('error', 'Unknown error')}")
                break
        else:
            print(f"Status check failed: {response.status_code}")

        time.sleep(1)

def get_result(task_id):
    """Get processing result"""
    headers = {'Authorization': 'Bearer testtoken123'}
    response = requests.get(f"{API_BASE}/api/result/{task_id}", headers=headers)
    if response.status_code == 200:
        result = response.json()
        print("\n=== PROCESSING RESULT ===")
        print(f"Empresa: {result.get('metadata', {}).get('designacao_social')}")
        print(f"NIF: {result.get('metadata', {}).get('nif')}")
        print(f"Ano: {result.get('metadata', {}).get('ano_exercicio')}")
        print(f"Volume Negócios: €{result.get('dados_financeiros', {}).get('volume_negocios', 0):,.2f}")
        print(f"Autonomia Financeira: {result.get('dados_financeiros', {}).get('autonomia_financeira', 0):.1%}")
        print(f"Rating: {result.get('analise', {}).get('rating')}")

        # Check for downloadable files
        for file_type in ['excel', 'json']:
            download_url = f"{API_BASE}/api/download/{task_id}/{file_type}"
            r = requests.head(download_url)
            if r.status_code == 200:
                print(f"✓ {file_type.upper()} file ready for download")
    else:
        print(f"Failed to get result: {response.status_code}")

if __name__ == "__main__":
    print("=== AiparatiExpress API Test ===\n")
    test_health()
    test_upload()