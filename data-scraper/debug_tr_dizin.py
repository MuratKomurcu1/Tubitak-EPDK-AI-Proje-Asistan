import requests
import json
import time
import csv
from datetime import datetime

class TRDizinAPIScraper:
    def __init__(self):
        self.base_url = "https://search.trdizin.gov.tr"
        self.api_endpoint = "/publication/"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8',
            'Referer': 'https://search.trdizin.gov.tr/tr/yayin/ara',
            'Origin': 'https://search.trdizin.gov.tr'
        }

    def get_projects(self, max_pages=10, limit=20):
        """TR Dizin API'den proje verilerini çeker"""
        all_projects = []
        
        for page in range(1, max_pages + 1):
            print(f"Sayfa {page} işleniyor...")
            
            params = {
                'q': '',
                'order': 'publicationYear-DESC',
                'page': page,
                'limit': limit,
                'facet-documentType': 'PROJECT'
            }
            
            try:
                url = f"{self.base_url}{self.api_endpoint}"
                response = requests.get(url, params=params, headers=self.headers)
                
                print(f"API İsteği: {response.url}")
                print(f"Status Code: {response.status_code}")
                
                if response.status_code == 200:
                    try:
                        data = response.json()
                        print(f"JSON verisi alındı, veri tipi: {type(data)}")
                        
                        # JSON yapısını incele
                        if isinstance(data, dict):
                            print(f"JSON anahtarları: {list(data.keys())}")
                            
                            # Projeler muhtemelen 'data', 'results', 'items' gibi bir anahtarda
                            projects = self.extract_projects_from_response(data)
                            
                            if projects:
                                print(f"Sayfa {page}: {len(projects)} proje bulundu")
                                all_projects.extend(projects)
                            else:
                                print(f"Sayfa {page}'de proje bulunamadı")
                                if page > 3:  # İlk birkaç sayfada veri yoksa dur
                                    break
                        else:
                            print(f"Beklenmeyen JSON formatı: {type(data)}")
                            
                    except json.JSONDecodeError:
                        print(f"JSON parse hatası. Response content: {response.text[:200]}")
                        
                else:
                    print(f"HTTP Hatası: {response.status_code}")
                    print(f"Response: {response.text[:500]}")
                    
                # Rate limiting
                time.sleep(2)
                
            except Exception as e:
                print(f"Sayfa {page} hatası: {e}")
                continue
        
        return all_projects

    def extract_projects_from_response(self, data):
        """API response'undan proje listesini çıkarır"""
        projects = []
        
        # Farklı olası JSON yapılarını kontrol et
        possible_keys = ['data', 'results', 'items', 'publications', 'content', 'records']
        
        project_list = None
        for key in possible_keys:
            if key in data:
                project_list = data[key]
                print(f"Projeler '{key}' anahtarında bulundu")
                break
        
        # Eğer root level bir liste ise
        if project_list is None and isinstance(data, list):
            project_list = data
            print("Projeler root level'da liste olarak bulundu")
        
        # Eğer data direkt dict içinde projeler varsa
        if project_list is None and isinstance(data, dict):
            # JSON içeriğini kaydet debug için
            with open(f'api_response_debug.json', 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print("JSON response debug için kaydedildi: api_response_debug.json")
            return []
        
        if project_list and isinstance(project_list, list):
            for item in project_list:
                project_info = self.parse_project_item(item)
                if project_info:
                    projects.append(project_info)
        
        return projects

    def parse_project_item(self, item):
        """Tek proje item'ını parse eder"""
        try:
            # TR Dizin API'nin gerçek field'larına göre parse et
            project = {
                'title': '',
                'abstract': '',
                'project_number': '',
                'researchers': [],
                'institution': '',
                'keywords': [],
                'year': '',
                'document_type': '',
                'subject_area': '',
                'language': ''
            }
            
            # Olası field isimleri (TR Dizin'e göre güncellenecek)
            title_fields = ['title', 'baslik', 'name', 'ad']
            abstract_fields = ['abstract', 'ozet', 'summary', 'aciklama']
            author_fields = ['authors', 'yazarlar', 'researchers', 'arastirmacilar']
            institution_fields = ['institution', 'kurum', 'affiliation', 'baglilik']
            year_fields = ['year', 'yil', 'date', 'tarih', 'publicationYear']
            keyword_fields = ['keywords', 'anahtarKelimeler', 'tags', 'etiketler']
            
            # Field'ları map et
            for field in title_fields:
                if field in item:
                    project['title'] = str(item[field])
                    break
            
            for field in abstract_fields:
                if field in item:
                    project['abstract'] = str(item[field])
                    break
            
            for field in year_fields:
                if field in item:
                    project['year'] = str(item[field])
                    break
            
            # Authors - liste veya string olabilir
            for field in author_fields:
                if field in item:
                    authors = item[field]
                    if isinstance(authors, list):
                        project['researchers'] = [str(author) for author in authors]
                    elif isinstance(authors, str):
                        project['researchers'] = [authors]
                    break
            
            # Institution - çoğunlukla string
            for field in institution_fields:
                if field in item:
                    project['institution'] = str(item[field])
                    break
            
            # Keywords - liste olabilir
            for field in keyword_fields:
                if field in item:
                    keywords = item[field]
                    if isinstance(keywords, list):
                        project['keywords'] = [str(kw) for kw in keywords]
                    elif isinstance(keywords, str):
                        project['keywords'] = keywords.split(',')
                    break
            
            # Diğer metadata
            if 'id' in item:
                project['project_number'] = str(item['id'])
            if 'documentType' in item:
                project['document_type'] = str(item['documentType'])
            if 'subjectArea' in item:
                project['subject_area'] = str(item['subjectArea'])
            
            # En azından title var mı kontrol et
            if project['title']:
                return project
            else:
                print(f"Proje title'ı bulunamadı. Item keys: {list(item.keys())}")
                return None
                
        except Exception as e:
            print(f"Proje parse hatası: {e}")
            return None

    def save_to_csv(self, projects, filename='tr_dizin_projects.csv'):
        """Projeleri CSV'ye kaydet"""
        if not projects:
            print("Kaydedilecek proje yok")
            return
        
        fieldnames = [
            'title', 'abstract', 'project_number', 'researchers', 
            'institution', 'keywords', 'year', 'document_type', 'subject_area'
        ]
        
        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            
            for project in projects:
                # List'leri string'e çevir
                project_copy = project.copy()
                project_copy['researchers'] = '; '.join(project.get('researchers', []))
                project_copy['keywords'] = '; '.join(project.get('keywords', []))
                writer.writerow(project_copy)
        
        print(f"{len(projects)} proje {filename} dosyasına kaydedildi")

    def save_to_json(self, projects, filename='tr_dizin_projects.json'):
        """JSON formatında kaydet"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(projects, f, ensure_ascii=False, indent=2)
        print(f"{len(projects)} proje {filename} dosyasına kaydedildi")

    def generate_sql_inserts(self, projects, filename='tr_dizin_inserts.sql'):
        """Node.js için SQL insert'ler oluştur"""
        if not projects:
            return
        
        sql_statements = []
        
        for i, project in enumerate(projects):
            # SQL injection'dan korunmak için string'leri escape et
            title = project.get('title', '').replace("'", "''")
            abstract = project.get('abstract', '').replace("'", "''")
            institution = project.get('institution', '').replace("'", "''")
            
            keywords_sql = "'{" + ','.join([f'"{kw}"' for kw in project.get('keywords', [])]) + "}'"
            researchers = project.get('researchers', [])
            principal_investigator = researchers[0] if researchers else 'Bilinmiyor'
            
            sql = f"""
INSERT INTO funded_projects (
    program_code, project_number, project_title, project_abstract,
    keywords, principal_investigator, institution, institution_type,
    sector, start_date, approved_budget, project_status, duration_months
) VALUES (
    'TUBITAK',
    'TR-{i+1:04d}',
    '{title}',
    '{abstract}',
    {keywords_sql},
    '{principal_investigator.replace("'", "''")}',
    '{institution}',
    'universite',
    'teknoloji',
    '{project.get("year", "2024")}-01-01',
    500000,
    'tamamlandi',
    24
);"""
            sql_statements.append(sql)
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write('\n'.join(sql_statements))
        
        print(f"SQL insert dosyası oluşturuldu: {filename}")

# Ana script
if __name__ == "__main__":
    scraper = TRDizinAPIScraper()
    
    print("TR Dizin API'den proje verilerini çekmeye başlıyor...")
    
    # İlk 5 sayfa test et
    projects = scraper.get_projects(max_pages=5, limit=20)
    
    if projects:
        print(f"\nToplam {len(projects)} proje başarıyla çekildi")
        
        # Verileri kaydet
        scraper.save_to_csv(projects)
        scraper.save_to_json(projects)
        scraper.generate_sql_inserts(projects)
        
        print("\nDosyalar oluşturuldu:")
        print("- tr_dizin_projects.csv")
        print("- tr_dizin_projects.json")
        print("- tr_dizin_inserts.sql")
        
        # İlk birkaç projeyi göster
        print(f"\nİlk 3 proje örneği:")
        for i, project in enumerate(projects[:3]):
            print(f"\n{i+1}. {project.get('title', 'Başlık yok')}")
            print(f"   Kurum: {project.get('institution', 'Bilinmiyor')}")
            print(f"   Yıl: {project.get('year', 'Bilinmiyor')}")
            
    else:
        print("Hiç proje verisi çekilemedi. API response'u kontrol edin.")