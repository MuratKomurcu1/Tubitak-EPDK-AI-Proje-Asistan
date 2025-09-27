import requests
import json
import time
import csv
from datetime import datetime
import re

class TRDizinScraper:
    def __init__(self):
        self.base_url = "https://search.trdizin.gov.tr/tr/yayin/ara"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        }
        self.session = requests.Session()
        self.session.headers.update(self.headers)

    def get_projects(self, page=1, limit=20, max_pages=50):
        """TR Dizin'den proje verilerini çeker"""
        projects = []
        
        for page_num in range(1, max_pages + 1):
            print(f"Sayfa {page_num} işleniyor...")
            
            params = {
                'q': '',
                'order': 'publicationYear-DESC',
                'page': page_num,
                'limit': limit,
                'facet-documentType': 'PROJECT'
            }
            
            try:
                response = self.session.get(self.base_url, params=params)
                
                if response.status_code == 200:
                    # HTML parse etmek yerine API endpoint'i bulalım
                    data = self.parse_project_data(response.text)
                    
                    if not data:
                        print(f"Sayfa {page_num}'de veri bulunamadı, durduruluyor...")
                        break
                        
                    projects.extend(data)
                    print(f"Sayfa {page_num}: {len(data)} proje bulundu")
                    
                    # Rate limiting
                    time.sleep(2)
                else:
                    print(f"HTTP Error {response.status_code} on page {page_num}")
                    break
                    
            except Exception as e:
                print(f"Sayfa {page_num} hatası: {e}")
                continue
        
        return projects

    def parse_project_data(self, html_content):
        """HTML içeriğinden proje verilerini parse eder"""
        # Bu fonksiyon TR Dizin'in HTML yapısına göre güncellenmeli
        # Gerçek implementasyon için site yapısını incelemek gerekiyor
        projects = []
        
        # Placeholder implementation
        # Gerçek TR Dizin HTML yapısına göre parse edilmeli
        
        return projects

    def extract_project_info(self, project_element):
        """Tek proje elementinden bilgileri çıkarır"""
        try:
            project_data = {
                'title': '',
                'abstract': '',
                'researchers': [],
                'institution': '',
                'project_number': '',
                'keywords': [],
                'year': '',
                'program_type': '',
                'budget': None,
                'status': ''
            }
            
            # HTML parsing logic burada olacak
            # BeautifulSoup kullanarak parse etmek daha uygun olabilir
            
            return project_data
            
        except Exception as e:
            print(f"Proje parse etme hatası: {e}")
            return None

    def save_to_csv(self, projects, filename='tubitak_projects.csv'):
        """Projeleri CSV dosyasına kaydeder"""
        if not projects:
            print("Kaydedilecek proje verisi yok")
            return
            
        fieldnames = [
            'title', 'abstract', 'researchers', 'institution', 
            'project_number', 'keywords', 'year', 'program_type',
            'budget', 'status'
        ]
        
        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            
            for project in projects:
                # List'leri string'e çevir
                project['researchers'] = '; '.join(project.get('researchers', []))
                project['keywords'] = '; '.join(project.get('keywords', []))
                writer.writerow(project)
        
        print(f"{len(projects)} proje {filename} dosyasına kaydedildi")

    def convert_to_json(self, projects, filename='tubitak_projects.json'):
        """Projeleri JSON dosyasına kaydeder"""
        with open(filename, 'w', encoding='utf-8') as jsonfile:
            json.dump(projects, jsonfile, ensure_ascii=False, indent=2)
        
        print(f"{len(projects)} proje {filename} dosyasına kaydedildi")

    def generate_sql_insert(self, projects, table_name='funded_projects'):
        """Node.js için SQL insert scriptleri oluşturur"""
        sql_statements = []
        
        for project in projects:
            # Güvenli SQL için değerleri escape et
            title = project.get('title', '').replace("'", "''")
            abstract = project.get('abstract', '').replace("'", "''")
            
            sql = f"""
INSERT INTO {table_name} (
    program_code, project_number, project_title, project_abstract,
    keywords, principal_investigator, institution, institution_type,
    sector, start_date, approved_budget, project_status
) VALUES (
    'TUBITAK',
    '{project.get('project_number', '')}',
    '{title}',
    '{abstract}',
    ARRAY[{', '.join([f"'{kw}'" for kw in project.get('keywords', [])])}],
    '{project.get('researchers', [''])[0] if project.get('researchers') else ''}',
    '{project.get('institution', '')}',
    'universite',
    'teknoloji',
    '{project.get('year', '2024')}-01-01',
    {project.get('budget', 500000)},
    'tamamlandi'
);"""
            sql_statements.append(sql)
        
        with open('tubitak_projects_insert.sql', 'w', encoding='utf-8') as sqlfile:
            sqlfile.write('\n'.join(sql_statements))
        
        print("SQL insert dosyası oluşturuldu: tubitak_projects_insert.sql")


# Alternatif: BeautifulSoup ile daha gelişmiş parsing
def advanced_scraper_with_beautifulsoup():
    """BeautifulSoup kullanarak daha detaylı scraping"""
    
    # Bu versiyonda BeautifulSoup kullanarak
    # TR Dizin'in gerçek HTML yapısını parse ederiz
    
    import requests
    from bs4 import BeautifulSoup
    
    url = "https://search.trdizin.gov.tr/tr/yayin/ara?q=&order=publicationYear-DESC&page=1&limit=20&facet-documentType=PROJECT"
    
    try:
        response = requests.get(url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # TR Dizin'in gerçek HTML yapısına göre selector'lar güncellenecek
        project_elements = soup.find_all('div', class_='project-item')  # Örnek selector
        
        projects = []
        for element in project_elements:
            project = extract_project_from_element(element)
            if project:
                projects.append(project)
        
        return projects
        
    except Exception as e:
        print(f"Scraping hatası: {e}")
        return []

def extract_project_from_element(element):
    """BeautifulSoup element'inden proje bilgisi çıkarır"""
    try:
        # TR Dizin HTML yapısına göre güncellenecek
        title = element.find('h3', class_='title')
        abstract = element.find('div', class_='abstract')
        
        return {
            'title': title.text.strip() if title else '',
            'abstract': abstract.text.strip() if abstract else '',
            # Diğer alanlar...
        }
    except:
        return None


# Ana çalıştırma scripti
if __name__ == "__main__":
    scraper = TRDizinScraper()
    
    print("TÜBİTAK projelerini TR Dizin'den çekme başlıyor...")
    
    # İlk 100 sayfa için projeler çek (2000 proje)
    projects = scraper.get_projects(max_pages=100)
    
    if projects:
        # Verileri farklı formatlarda kaydet
        scraper.save_to_csv(projects)
        scraper.convert_to_json(projects)
        scraper.generate_sql_insert(projects)
        
        print(f"\nToplam {len(projects)} proje başarıyla çekildi")
        print("Dosyalar oluşturuldu:")
        print("- tubitak_projects.csv")
        print("- tubitak_projects.json") 
        print("- tubitak_projects_insert.sql")
    else:
        print("Hiç proje verisi çekilemedi")