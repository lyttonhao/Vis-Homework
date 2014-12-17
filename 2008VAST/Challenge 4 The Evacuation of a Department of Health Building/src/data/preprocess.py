import csv

def proc_building():
	file1 = open('building_data.txt', 'rb')
	file2 = open('proced_building.txt', 'wb')
	for line in file1:
		file2.write(line[:-1])
	file1.close()
	file2.close()

def proc_name():
	file1 = open('OCCUPANTS_RFID_ASSIGNMENTS.txt', 'rb')
	stripped = [line.strip() for line in file1]
	print stripped
	lines = [line for line in stripped if line]
	print lines[1]
	with open('proced_name.csv', 'wb') as file2:
		writer = csv.writer( file2 )
		writer.writerow(['id', 'name'])
		for line in lines:
			writer.writerow(  line.split('\t') )
	file1.close()

def proc_pathway():
	file1 = open('RFID_PATHWAY_DATA_v2.txt', 'rb')
	stripped = [line.strip() for line in file1]
	#print stripped
	lines = [line for line in stripped if line]
	with open('proced_pathway.csv', 'wb') as file2:
		writer = csv.writer( file2 )
		for line in lines:
			writer.writerow(  line.split('\t') )
	file1.close()



if __name__ == '__main__':
	proc_building()
	proc_name()
	proc_pathway()