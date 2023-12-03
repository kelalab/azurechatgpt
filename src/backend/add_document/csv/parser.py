import csv
from io import StringIO
class CsvParser:
    def parse(self, input, split):
        '''
        Params
        ------
        input
        split 
            0 for no split 
            other than 0 for row split
        '''
        content = StringIO(input.read().decode('latin-1'))
        r = csv.reader(content)
        i = 0
        data = []
        for row in r:
            if row[0].lower().find('sarake') == -1:
                data.append(row[0].replace(';','').replace('\x80','€'))
            i += 1
        if split == 0:
            data = "\\n".join(data)
            data = [data]
        return data