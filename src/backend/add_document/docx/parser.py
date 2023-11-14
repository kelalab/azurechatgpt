from docx import Document

class DocxParser:
    def generate_headers(self, depth, titles):
        header = {}
        header_val = 1
        for title in titles:
            if len(title) == 0:
                continue
            header['Header ' + str(header_val)] = title
            header_val = header_val + 1
        
        return header

    def parse(self, input):
        data = []
        doc = Document(input)

        for table in doc.tables:
            titles = ['','','','','','']
            depth = 0
            last_depth = 0
            text = ''
            for i, row in enumerate(table.rows):
                p = row.cells[0].paragraphs[0]

                if p.style.name.startswith('Heading'):
                    if depth > 0:
                        if len(text) > 0:
                            data.append((self.generate_headers(depth, titles), text))
                        text = ''

                    depth = int(row.cells[0].paragraphs[0].style.name[-1])
                    if depth < last_depth:
                        for i in range(depth, len(titles)):
                            titles[i] = ''

                    last_depth = depth
                    title = row.cells[0].paragraphs[0].text
                    titles[depth] = title
                else:
                    text = text + '\n'.join(cell.text for cell in row.cells)

        return data
