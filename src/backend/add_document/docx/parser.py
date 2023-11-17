from docx import Document

class DocxParser:
    def generate_headers(self, titles):
        header = {}
        header_val = 1
        for title in titles:
            if len(title) == 0:
                continue
            header['Header ' + str(header_val)] = title
            header_val = header_val + 1
        
        return header

    def merge_to_last(self, data, p, max_depth):
        if max_depth == 0:
            data.append(p)
        else:
            if len(data) == 0:
                while len(p[0]) > max_depth:
                    last_heading = p[0].popitem()[1]
                    text = last_heading + '\n\n' + p[1]
                    p = (p[0], text)
                data.append(p)
            else:
                last_item = data.pop()
                last_heading = p[0][list(p[0].keys())[-1]]
                item = (last_item[0], last_item[1] + '\n\n' + last_heading + '\n\n' + p[1])
                data.append(item)

    def parse(self, input, max_depth):
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
                            p = (self.generate_headers(titles), text)
                            if len(self.generate_headers(titles)) > max_depth:
                                self.merge_to_last(data, p, max_depth)
                            else:
                                data.append(p)
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

            if len(text) > 0:
                p = (self.generate_headers(titles), text)
                if len(self.generate_headers(titles)) > max_depth:
                    self.merge_to_last(data, p, max_depth)
                else:
                    data.append(p)

        return data
