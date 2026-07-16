import pypdf
import csv
import re
import os
import sys

def get_target_file(default_path=None):
    # If a hardcoded path was explicitly provided at the bottom, use it if it exists
    if default_path and os.path.exists(default_path):
        return default_path

    # Dynamic Fallbacks
    if os.environ.get('FILE'):
        return os.environ.get('FILE')
    if len(sys.argv) > 1:
        return sys.argv[1]
    for f in os.listdir('.'):
        if f.startswith('fs_') and f.endswith('.pdf'):
            return f
            
    raise FileNotFoundError("Could not find the schedule PDF.")

def parse_schedule(pdf_path=None, output_csv_path=None):
    # Resolve the PDF path using your logic framework
    resolved_pdf_path = get_target_file(pdf_path)
    
    # Resolve output path: Use explicitly passed path, otherwise generate dynamically
    if not output_csv_path:
        output_csv_path = os.path.splitext(resolved_pdf_path)[0] + "_parsed.csv"
    
    reader = pypdf.PdfReader(resolved_pdf_path)
    all_records = []
    valid_prefixes = r'(?:AB\d|MAB\d|ADB)'

    for page in reader.pages:
        text = page.extract_text()
        if not text:
            continue
            
        for line in text.split('\n'):
            line = line.strip()
            if not line:
                continue
            
            # 1. Match Course Code
            code_match = re.match(r'^([A-Z]{3,5}\d{3,4}[A-Z]?)', line)
            if not code_match:
                continue
            course_code = code_match.group(1)
            
            # 2. Match Venue
            venue_match = re.search(rf'\b({valid_prefixes}\s*-\s*\d+[A-Za-z]*)', line)
            if venue_match:
                venue_str = venue_match.group(1).replace(" ", "")
                
                # 3. Enhanced Slot Matching (Captures even if glued to text tags like BYBE1+TE1)
                slot_match = re.search(r'([A-G]\d\+T?[A-G]\d(?:\+T[A-G]{2}\d)?|L\d+\+L\d+(?:\+L\d+)*|[A-G]\d|L\d+)', line)
                slot_str = slot_match.group(1) if slot_match else "UNKNOWN"
                
                all_records.append({
                    "Course Code": course_code,
                    "Slot": slot_str,
                    "Venue": venue_str
                })

    with open(output_csv_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=["Course Code", "Slot", "Venue"])
        writer.writeheader()
        writer.writerows(all_records)
        
    print(f"Flawlessly processed {len(all_records)} records to {output_csv_path}")

# Main execution maintaining your exact directory targeting pattern:
if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    pdf_path = os.path.join(script_dir, 'fs_2627.pdf')
    output_csv = os.path.join(script_dir, 'parsed_table.csv')
    
    parse_schedule(pdf_path, output_csv)