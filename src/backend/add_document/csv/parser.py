import csv
from io import StringIO
class CsvParser:
    def parse(self, input):
        content = StringIO(input.read().decode('latin-1'))
        r = csv.reader(content)
        i = 0
        data = []
        for row in r:
            print(row[0])
            if row[0].lower().find('sarake') == -1:
                data.append(row[0].replace(';','').replace('\x80','€'))
            i += 1
        print('csv data', data)
        return data