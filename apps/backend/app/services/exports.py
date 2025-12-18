import csv
import io
from typing import List, Dict, Any
from datetime import datetime

class ExportService:
    @staticmethod
    def generate_accounting_csv(documents: List[Dict[str, Any]]) -> str:
        """
        Generates a basic accounting CSV from a list of generated documents.
        """
        output = io.StringIO()
        writer = csv.writer(output, delimiter=';')
        
        # Headers (Simplified for basic accounting)
        writer.writerow(["Date", "Document", "Type", "Client", "HT", "TVA", "TTC", "Status"])
        
        for doc in documents:
            # Assuming current_totals has the computed amounts
            totals = doc.get("current_totals", {})
            writer.writerow([
                doc.get("updated_at", "").split("T")[0] if isinstance(doc.get("updated_at"), str) else doc.get("updated_at").strftime("%Y-%m-%d"),
                doc.get("doc_number", f"ID-{doc.get('id')}"),
                doc.get("type"),
                doc.get("client_name", "N/A"),
                totals.get("total_ht", 0),
                totals.get("total_tva", 0),
                totals.get("total_ttc", 0),
                doc.get("status")
            ])
            
        return output.getvalue()

    @staticmethod
    def generate_fec(documents: List[Dict[str, Any]]) -> str:
        """
        Generates a simplified FEC (Fichier des Ecritures Comptables) format.
        Real FEC is complex; this is a compliant placeholder/baseline.
        """
        output = io.StringIO()
        # FEC is typically Tab-separated or Pipe-separated. We'll use Pipe.
        writer = csv.writer(output, delimiter='|')
        
        # FEC Required Headers (Simplified version of DGFiP requirements)
        headers = [
            "JournalCode", "JournalLib", "EcritureNum", "EcritureDate",
            "CompteNum", "CompteLib", "CompAuxNum", "CompAuxLib",
            "PieceRef", "PieceDate", "EcritureLib", "Debit", "Credit",
            "EcritureLet", "DateLet", "ValidDate", "Montantdevise", "Idevise"
        ]
        writer.writerow(headers)
        
        for doc in documents:
            date_str = doc.get("updated_at").strftime("%Y%m%d") if hasattr(doc.get("updated_at"), "strftime") else "20250101"
            totals = doc.get("current_totals", {})
            
            # Entry 1: Income (Credit)
            writer.writerow([
                "VT", "VENTES", doc.get("id"), date_str,
                "706000", "PRESTATIONS", "", "",
                doc.get("doc_number"), date_str, f"Facture {doc.get('doc_number')}",
                "0", str(totals.get("total_ht", 0)).replace(".", ","),
                "", "", date_str, "", ""
            ])
            # Entry 2: Client Account (Debit)
            writer.writerow([
                "VT", "VENTES", doc.get("id"), date_str,
                "411000", "CLIENT", "CLT-" + str(doc.get("client_id")), doc.get("client_name"),
                doc.get("doc_number"), date_str, f"Facture {doc.get('doc_number')}",
                str(totals.get("total_ttc", 0)).replace(".", ","), "0",
                "", "", date_str, "", ""
            ])
            # Entry 3: VAT (Credit)
            if totals.get("total_tva", 0) > 0:
                writer.writerow([
                    "VT", "VENTES", doc.get("id"), date_str,
                    "445710", "TVA COLLECTEE", "", "",
                    doc.get("doc_number"), date_str, f"TVA sur {doc.get('doc_number')}",
                    "0", str(totals.get("total_tva", 0)).replace(".", ","),
                    "", "", date_str, "", ""
                ])
                
        return output.getvalue()

export_service = ExportService()
