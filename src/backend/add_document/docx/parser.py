from docx import Document

class DocxParser:
    def parse(self, input):
        doc = Document(input)
        table = doc.tables[0]
        data = []

        headers = ''
        for i, row in enumerate(table.rows):
            text = (cell.text for cell in row.cells)

            # Establish the mapping based on the first row
            # headers; these will become the keys of our dictionary
            if i == 0:
                keys = tuple(text)
                continue

            # Construct a list for this row, mapping
            # keys to values for this row
            row_data = list(zip(keys, text))
            
            if (i % 2) == 0:
                data.append((headers, row_data[0][1]))
            else:
                headers = {'Header 1': row_data[0][0], 'Header2': row_data[0][1]}

        return data
