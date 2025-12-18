from docxtpl import DocxTemplate
import io
import re
from typing import Set, Dict, Any

class TemplateEngine:
    @staticmethod
    def extract_variables(docx_content: bytes) -> Set[str]:
        # docxtpl uses jinja2-like syntax {{ variable }}
        # We can use docxtpl's internal get_undeclared_template_variables if accessible 
        # or a simple regex for {{ ... }} 
        # Regex is more reliable for raw DOCX if we don't want to load it fully yet
        
        doc = DocxTemplate(io.BytesIO(docx_content))
        return doc.get_undeclared_template_variables()

    @staticmethod
    def generate_json_schema(variables: Set[str]) -> Dict[str, Any]:
        properties = {}
        required = []
        
        for var in variables:
            # Basic mapping logic: 
            # variables containing 'date' -> string format date
            # variables containing 'price', 'qty', 'amount' -> number
            # rest -> string
            
            var_type = "string"
            if any(k in var.lower() for k in ["qty", "quantite", "quantity", "price", "amount", "prix", "montant"]):
                var_type = "number"
            
            properties[var] = {
                "type": var_type,
                "title": var.replace("_", " ").capitalize()
            }
            required.append(var)
            
        return {
            "type": "object",
            "properties": properties,
            "required": required
        }

template_engine = TemplateEngine()
